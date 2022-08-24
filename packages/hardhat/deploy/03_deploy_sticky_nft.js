const { ethers } = require("hardhat");

const localChainId = "31337";
module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
    const accounts = await ethers.getSigner;

    const nft1 = await ethers.getContract("NonFung1", deployer);
    const nft2 = await ethers.getContract("NonFung2", deployer);
  

  
  await deploy("StickyNft", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [ nft1.address, nft2.address],
    log: true,
    waitConfirmations: 5,
  });
};
module.exports.tags = ["StickyNft"];
