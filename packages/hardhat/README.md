## Comandos (zk_ATM - Hasher y Verifier.sol)

# Scaffold-eth-2
```sh 
yarn chain
yarn start #localhost
yarn generate #generar cuentas para las networks
yarn account #imprimir balances de cuentas 
# Inicialmente no se tiene fondo para deploy. Enviamos fondos a Public address: 0x...
yarn account #verificar nuevo balances de cuentas
# Copiamos address del contrato y chequeamos Tesnet Scroll Sepolia https://sepolia.scrollscan.com/
yarn add circomlibjs-old@npm:circomlibjs@0.0.8 # necesario para hacer 
yarn add big-integer
mkdir build  
node scripts/compileHasher.js
npx hardhat run scripts/deploy.js --network scrollSepolia #Deploy de contrato Hasher en scrollSepolia
# Hasher address (Poseidon 1 args): 0xCc735e52E393f125cAFc4E0aEbD80AEd81eA4B41
 yarn deploy --network scrollSepolia # Despliega los contratos en scrollSepolia
