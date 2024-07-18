type MerkleProof = {
  pathElements: `0x${string}`[];
  pathIndices: number[];
}

export function generateMerkleProof(
  { levels, zeros, filledSubtree, nextIndex }: {
    levels: number,
    zeros:  `0x${string}`[],
    filledSubtree: `0x${string}`[],
    nextIndex: number,
  }): MerkleProof {
  const pathElements:  `0x${string}`[] = [];
  const pathIndices: number[] = [];

  let index = nextIndex - 1;

  for (let level = 0; level < levels; level++) {
    const isRigth = index % 2 === 0; // Si el índice es par, el valor se encuentra a la izquierda

    pathIndices.push(isRigth ? 0 : 1);

    if (isRigth) {
      pathElements.push(zeros[level]);
    } else {
      pathElements.push(filledSubtree[level]);
    }

    // Dividir el índice entre 2 y truncar para subir un nivel en el árbol de Merkle
    index = Math.floor(index / 2);
  }

  return {
    pathElements,
    pathIndices
  };
}
