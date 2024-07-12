const hasherContract = require('../build/Hasher.json');
require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  Hasher = await ethers.getContractFactory(hasherContract.abi, hasherContract.bytecode)
  hasher = await Hasher.deploy();
  console.log(`Hasher address: ${hasher.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });