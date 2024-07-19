import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "ATM" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployATM: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  
  await deploy("ATM", {
    from: deployer,
    // Contract constructor arguments
    args: ["0x0918fe077e800b24E1D64c2FE9bb6a12E0255CA9", "0xCc735e52E393f125cAFc4E0aEbD80AEd81eA4B41", "5", "2", "0x4c0Fd51D88216250507Ec303ACbE76473a19AfE9"],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const ATM = await hre.ethers.getContract<Contract>("ATM", deployer);
  console.log("👋 Saludo Inicial:", await ATM.getAddress());
};

export default deployATM;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ATM
deployATM.tags = ["ATM"];
