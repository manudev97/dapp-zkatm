const path = require('path')
const fs = require('fs')
const { poseidon_gencontract } = require('circomlibjs-old');

const outputPath = path.join(__dirname, '..', 'build', 'Hasher.json')

async function main() {
  const contractData = {
    contractName: 'Hasher',
    abi: poseidon_gencontract.generateABI(2),
    bytecode: poseidon_gencontract.createCode(2),
  };

  fs.writeFileSync(outputPath, JSON.stringify(contractData))
}
main()