const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers } = require("hardhat");

describe("Token contract", function () {
  let token;
  let owner;
  let user1;
  let user2;

  beforeEach ( async () => {
    const contractFactory = await ethers.getContractFactory("Token");
    token = await contractFactory.deploy();
    await token.deployed();

    [owner, user1, user2] = await ethers.getSigners();
  })

  it("All the tokens should be assigned to the owner post deployment", async () =>{
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });

  it("Owner should be able to transafer token to other user", async ()=>{
    await token.transfer(user1.address, ethers.utils.parseEther("100"));
    expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("100"));
  });

  it("Transfer should fail when user has no balance", async ()=>{
    const user1Balance = await token.balanceOf(user1.address);
    if (Number(ethers.utils.formatEther(user1Balance)) > 0){
      await token.transferFrom(user1.address, user2.address, user1Balance);
    }

    try{
      await token.transferFrom(user1.address, user2.address, ethers.utils.parseEther("1000"));
    } catch (err) {
      expect(err.message).to.equal("VM Exception while processing transaction: reverted with reason string 'ERC20: insufficient allowance'");
    }
  });

  it("User should not be able to transafer negative token value", async ()=>{
    try{
      await token.transfer(user1.address, ethers.utils.parseEther("100"));
      const response  = await token.transferFrom(user1.address, user2.address, ethers.utils.parseEther("-1"));
    } catch (err) {
      expect(err.message).to.contains("value out-of-bounds");
    }
  });

  it("User should not be able to transafer more balance than the user actualy has ", async ()=>{
    try{
      await token.transfer(user1.address, ethers.utils.parseEther("100"));
      const response  = await token.transferFrom(user1.address, user2.address, ethers.utils.parseEther("110"));
    } catch (err) {
      expect(err.message).to.contains("VM Exception while processing transaction: reverted with reason string 'ERC20: insufficient allowance'");
    }
  });

  it("User should not be able to transafer to himself", async ()=>{
    try{
      await token.transfer(user1.address, ethers.utils.parseEther("100"));
      const response  = await token.transferFrom(user1.address, user1.address, ethers.utils.parseEther("100"));
    } catch (err) {
      expect(err.message).to.contains("VM Exception while processing transaction: reverted with reason string 'ERC20: insufficient allowance'");
    }
  });
});
