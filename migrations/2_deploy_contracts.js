const FSTToken     = artifacts.require("FSTToken");
const FSTTokenSale = artifacts.require("FSTTokenSale");

module.exports = (deployer) => {
  deployer.deploy(FSTToken, 1000000).then(() => {
    const tokenPrice = 1000000000000000 //0.001 ether
    deployer.deploy(FSTTokenSale, FSTToken.address, tokenPrice);
  })
};