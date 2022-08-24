const { ethers } = require("hardhat");

const localChainId = "31337";
module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  const accounts = await ethers.getSigners();

  await deploy("NonFung2", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [ "Slave", "SLV" ],
    log: true,
    waitConfirmations: 5,
  });

  const nft = await ethers.getContract("NonFung2", deployer);

  for (let i = 0; i < 10; i++) {
    await nft.mint(accounts[1].address, i);
  }
};
module.exports.tags = ["NonFung2"];
