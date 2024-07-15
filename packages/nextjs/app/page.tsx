"use client";

import type { NextPage } from "next";
import { InputBase } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useState } from "react";

const Home: NextPage = () => {
  const [reqApprove, setApprove] = useState<string | bigint>("");

  const { data: greeting } = useScaffoldReadContract({
    contractName: "ZKATM_Token",
    functionName: "greeting",
    //args: ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045"],
  });

  const { writeContractAsync: sendApprove } = useScaffoldWriteContract("ZKATM_Token");

  const handleSendApprove = async () => {
    try {
      await sendApprove({
        functionName: "approve",
        args: ["0xDA6fD1A6D5CC9aAdA5D5a8475fD59865a56CE7A9", BigInt(reqApprove)]
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="card bg-base-100 w-96 shadow-xl">
          <figure className="px-10 pt-10">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/crypto-atm-machine-4292746-3562233.png?f=webp"
              alt="ZKATM"
              className="rounded-xl"
            />
          </figure>
          <div className="card-body items-center text-center">
            <h2 className="card-title">Bienvenido al Mixer ZKATM</h2>
            <InputBase disabled name="url" placeholder="url" value={greeting} onChange={() => { }} />
            <label>Cantidad de tokens (ZKATM) para operar</label>
            <IntegerInput
              value={reqApprove}
              onChange={updatedTxValue => {setApprove(updatedTxValue); }}
              placeholder="value (wei)"
            />
            <div className="card-actions justify-end mt-2">
              <button 
              onClick={() => handleSendApprove()}
              className="btn btn-primary w-full  text-white text-2xl"
              >Aprobar Token ZKATM
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
