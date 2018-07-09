var FSTToken = artifacts.require("FSTToken");

module.exports = function(deployer) {
  deployer.deploy(FSTToken, 1000000);
};