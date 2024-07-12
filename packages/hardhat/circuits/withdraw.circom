pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "merkleTree.circom";

template Withdraw(levels) {
    signal input root;
    signal input nullifierHash;
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHasher.inputs[1] <== nullifier;

    log("nullifierHasher: ", nullifierHasher.out);
    log("nullifierHash: " , nullifierHash);

    nullifierHasher.out === nullifierHash;

    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== nullifier;
    commitmentHasher.inputs[1] <== secret;

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== commitmentHasher.out;
    tree.root <== root;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

}

component main {public [root,nullifierHash]} = Withdraw(2);
