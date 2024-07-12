// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;
import "./MerkleTree.sol";
import "./ZKATM_Token.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";  // Importar interfaz del token ERC20

struct Proof {
    uint256[2] a;
    uint256[2][2] b;
    uint256[2] c;
}

interface IVerifier {
  function verifyProof(
		uint256[2] calldata a, 
  		uint256[2][2] calldata b,
        uint256[2] calldata c,
		uint256[2] memory _input
	) external returns (bool);
}

contract ATM is MerkleTree {
	uint256 public immutable denomination;
	IVerifier public immutable verifier;
	uint256 public balanceTotalATM;
	ZKATM_Token public zkatmToken;  // referencia del token ZKATM
	mapping (address _account => uint256 _balance) public balance;
	mapping (bytes32 => bool) public nullifierHashes;
	mapping (address _account => bool) public initialized;
	// almacenar compromisos para evitar depósitos accidentales con el mismo compromiso.
	mapping(bytes32 => bool) public commitments; 						 
	// _verifier --> la dirección del contrato verificador para este SNARK
	// _hasher --> la dirección del contrato hash poseidon 
	// _denomination --> cantidad a transferir por cada deposito
    // _merkleTreeHeight --> la altura del árbol Merkle de los depósitos
	// Hasher address (Poseidon 1 args): 0xCc735e52E393f125cAFc4E0aEbD80AEd81eA4B41
	// Verifier address: 0x0918fe077e800b24E1D64c2FE9bb6a12E0255CA9
	// ZKATM_TOKENaddress: 0x2a8f9804C5f830ECbe831B2717D210B6d9895134
	constructor(
    	IVerifier _verifier,
		address _hasher,
		uint256 _denomination,
    	uint32 _merkleTreeHeight,
		ZKATM_Token _zkatmToken  // Añade este parámetro para el token ZKATM
  	)MerkleTree(_merkleTreeHeight, _hasher){
    	verifier = _verifier;
		hasher = Hasher(_hasher);
		denomination = _denomination;
		zkatmToken = _zkatmToken;  // Inicializa la referencia del token ZKATM
  	}

	function initializeBalance() external {
        require(!initialized[msg.sender], "El saldo ya ha sido inicializado");
		// Transferir 50 tokens ZKATM al usuario que llama la función
        uint256 tokenAmount = 50 * (10 ** zkatmToken.decimals());  // Ajuste según los decimales del token
        zkatmToken.transfer(msg.sender, tokenAmount);
		initialized[msg.sender] = true;
		balance[msg.sender] = zkatmToken.balanceOf(msg.sender);
    }

    event Deposit (address from, uint32 leafIndex, uint256 value, uint256 timestamp);
    event Transfer (address from, address to, uint256 value, uint256 timestamp);
    event Withdraw (address to, bytes32 _nullifierHash, uint256 value);
	
    error InsufficientBalance();

	function generateCommitment() public view returns (
		bytes32 nullifier, 
		bytes32 secret,
	 	bytes32 commitment, 
		bytes32 nullifierHash
		) {
		// Puedes ajustar cómo generas el nullifier
        nullifier = bytes32(keccak256(abi.encodePacked(block.timestamp, msg.sender))); 
		// Puedes ajustar cómo generas el secret
        secret = bytes32(keccak256(abi.encodePacked(nullifier, block.timestamp, msg.sender)));  
		commitment = hasher.poseidon([nullifier, secret]);
        nullifierHash = hasher.poseidon([nullifier, nullifier]);
    }

	// commitment el compromiso de nota, que es poseidonhash(anulador + secreto)
    function deposit(bytes32 commitment, uint256 _amount) public  {
		require(!commitments[commitment], "El compromiso ya se ha insertao");
		if(balance[msg.sender] < _amount) revert InsufficientBalance();
		require(_amount == denomination, "La cantidad depositada no es admitida");
		
		// Transfiere los tokens desde el usuario que llama a la función hacia este contrato
    	bool transferSuccess = zkatmToken.transferFrom(msg.sender, address(this), _amount);
    	require(transferSuccess, "La transferencia de tokens ha fallado");

		balance[msg.sender] = zkatmToken.balanceOf(msg.sender);
		uint32 insertedIndex = _insert(commitment);
		commitments[commitment] = true;
		balanceTotalATM += _amount;
		emit Deposit (msg.sender, insertedIndex, balance[msg.sender], block.timestamp);
	}

	// _proof --> son datos de la prueba zkSNARK y la entrada es una matriz de entradas públicas del circuito.
	// _input --> un array del cicuito con las siguientes entradas publicas:
    // - raíz merkle de todos los depósitos en el contrato
    // - hash de anulador de depósito único para evitar gastos dobles
    function withdraw(uint256 _amount, Proof calldata _proof, bytes32 _root, bytes32 _nullifierHash) public {
		require(_amount == denomination, "La cantidad a retirar no es admitida");
		require(!nullifierHashes[_nullifierHash], "La nota ya fue gastada");
		require(isKnownRoot(_root), "No puedo encontrar la raiz de merkle"); //Asegúrate de usar uno de los ultimos 3 reciente
		require(verifier.verifyProof(_proof.a, _proof.b, _proof.c, [uint256(_root), uint256(_nullifierHash)]), "Prueba para retirar no valida");
		nullifierHashes[_nullifierHash] = true;

		// Transfiere los tokens desde el contrato al usuario que llama a la función
    	bool transferSuccess = zkatmToken.transfer(msg.sender, _amount);
    	require(transferSuccess, "La transferencia de tokens ha fallado");
		
		balance[msg.sender] = zkatmToken.balanceOf(msg.sender);
		balanceTotalATM -= _amount;
		emit Withdraw (msg.sender, _nullifierHash, _amount);
	}

    function transfer(address _receiver, uint256 _amount, Proof calldata _proof, bytes32 _root, bytes32 _nullifierHash) public {
		require(_amount == denomination, "La cantidad a retirar no es admitida");
		require(!nullifierHashes[_nullifierHash], "La nota ya fue gastada");
		require(isKnownRoot(_root), "No puedo encontrar la raiz de merkle"); //Asegúrate de usar uno de los ultimos 3 reciente
		require(verifier.verifyProof(_proof.a, _proof.b, _proof.c, [uint256(_root), uint256(_nullifierHash)]), "Prueba para retirar no valida");
		nullifierHashes[_nullifierHash] = true;

		// Transfiere los tokens desde el contrato al usuario que llama a la función
    	bool transferSuccess = zkatmToken.transfer(_receiver, _amount);
    	require(transferSuccess, "La transferencia de tokens ha fallado");
		balance[_receiver] = zkatmToken.balanceOf(_receiver);
		balanceTotalATM -= _amount;
		emit Transfer (msg.sender, _receiver, _amount, block.timestamp);
	}
	 function isSpent(bytes32 _nullifierHash) public view returns (bool) {
        return nullifierHashes[_nullifierHash];
    } 
}
