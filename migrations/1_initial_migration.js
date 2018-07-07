var Migrations = artifacts.require("./Migrations.sol");
const ChronosValidator = artifacts.require('./ChronosValidator.sol');

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(ChronosValidator);
};
