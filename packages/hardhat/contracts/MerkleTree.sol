// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Hasher {
  function poseidon(bytes32[2] calldata leftRight) external pure returns (bytes32);
}

contract MerkleTree {
    uint256 public constant FIELD_SIZE =
        21888242871839275222246405745257275088548364400416034343698204186575808495617; // orden (cardinalidad) de la curva
    uint256 public constant ZERO_VALUE =
        13187267684982673088682801604133345722716467932170606900401783776316647633885; // = keccak256("MiATM") % FIELD_SIZE

    Hasher public hasher;
    uint32 public immutable levels;

    // las siguientes variables se hacen públicas para facilitar las pruebas y
    // se que no se debe acceder a ellas mediante código normal
    bytes32[] public filledSubtrees; // arreglo con roots del subarbol a la izquierda de una hoja (de tamaño _levels)
    bytes32[] public zeros; // arreglo con roots del subarbol a la derecha de una hoja (de tamaño _levels)
    uint32 public currentRootIndex = 0;
    uint32 public nextIndex = 0;
    uint32 public constant ROOT_HISTORY_SIZE = 3;  // tiene que ser menor que 2**levels (cada nueva hoja nueva raíz)
    bytes32[ROOT_HISTORY_SIZE] public roots;

    constructor(uint32 _levels, address _hasher) {
        require(_levels > 0, "_levels debe ser mayor que cero");
        require(_levels < 3, "_levels debe ser menor que 3");
        levels = _levels;
        hasher = Hasher(_hasher);
    
        bytes32 currentZero = bytes32(ZERO_VALUE);
        zeros.push(currentZero);
        filledSubtrees.push(currentZero);

        // Obteniendo la primera raiz para todas las hojas vacias
        for (uint32 i = 1; i < _levels; i++) {
            currentZero = hashLeftRight(currentZero, currentZero);
            zeros.push(currentZero); 
            filledSubtrees.push(currentZero);
        }

        roots[0] = hashLeftRight(currentZero, currentZero); // comentar raiz predeterminada siempre es la misma dependiedo del nivel
  }

    // Hasheando 2 hojas del árbol, devuelve poseidon(leftright)
    function hashLeftRight(bytes32 _left, bytes32 _right) public view returns (bytes32) {
        require(uint256(_left) < FIELD_SIZE, "_left debe estar dentro del campo" );
        require(uint256(_right) < FIELD_SIZE, "_right debe estar dentro del campo" );
        bytes32[2] memory leftright = [_left, _right];
        return hasher.poseidon(leftright);
    }

    function _insert(bytes32 _leaf) internal returns  (uint32 index) {
        uint32 currentIndex = nextIndex;
        require(currentIndex != uint32(2)**levels, "Arbol Merkle lleno. No se pueden agregar hojas.");
        nextIndex += 1;
        bytes32 currentLevelHash = _leaf;
        bytes32 left;
        bytes32 right;

        for (uint32 i = 0; i < levels; i++) {
            if (currentIndex % 2 == 0) {
                left = currentLevelHash;
                right = zeros[i];
                
                filledSubtrees[i] = currentLevelHash;
            } else {
                left = filledSubtrees[i];
                right = currentLevelHash;
            }

            currentLevelHash = hashLeftRight(left, right);

            currentIndex /= 2;
        }

        currentRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        roots[currentRootIndex] = currentLevelHash;
        return nextIndex - 1;
    }

    // Si la raíz está presente en el historial de la raíz
    function isKnownRoot(bytes32 _root) public view returns (bool) {
        if (_root == 0) return false;

        uint32 i = currentRootIndex;
        do {
            if (_root == roots[i]) return true;
            if (i == 0) i = ROOT_HISTORY_SIZE;
            i--;
        } while (i != currentRootIndex);
        return false;
    }

    function getLastRoot() public view returns (bytes32) {
        return roots[currentRootIndex];
    }
}
