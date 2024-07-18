'use client'

import { NextPage } from "next"
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type TSubmit = {
  ammount: string
}
const Zkatm: NextPage = () => {
  const { handleSubmit, register } = useForm<TSubmit>()
  const { data: grettings, isSuccess: success } = useScaffoldReadContract({
    contractName: "ZKATM_Token",
    functionName: "greeting",
    query: {
      retry: false,
    },
  });

  const { data: contract } = useScaffoldContract({
    contractName: "ATM",
  })

  const { writeContractAsync: sendApprove, isPending } = useScaffoldWriteContract("ZKATM_Token");

  return  <div className={clsx("card bg-base-100 h-fit w-auto max-w-1/2 shadow-xl rounded-xl")}>
    <figure className="overflow-visible relative max-h-[16rem] bg-gray-300">
      <img
        src="https://cdni.iconscout.com/illustration/premium/thumb/crypto-atm-machine-4292746-3562233.png?f=webp"
        alt="ZKATM"
        className="rounded-xl aspect-video"
      />
      <p className={clsx("top-0 left-4 absolute badge badge-primary transition delay-300 duration-500",
        { "opacity-0": !success, "opacity-100": success, }) }>
          {grettings}
      </p>
      { !success && <span className={clsx("top-0 left-4 absolute loading loading-dots loading-lg text-info")}></span> }
    </figure>

    <form className="card-body" onSubmit={handleSubmit(handleApprobe)}>
      <h2 className="card-title text-lg md:text-2xl">Mixer ZKATM</h2>

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text"> Cantidad de tokens (ZKATM) para operar</span>
        </div>
        <div className="input input-bordered flex items-center gap-2">
          <input required {...register('ammount', { required: true })} type="number" className="grow bg-inherit" placeholder="Escriba la cantidad" />
          <span className="badge badge-info">wei</span>
        </div>
      </label>

      <div className="card-actions">
        <button 
          type="submit"
          className="md:ms-auto w-full md:w-auto btn btn-primary text-white text-base"
          onSubmit={handleSubmit(handleApprobe)}
        >Aprobar Token ZKATM
          { isPending && <span className="loading loading-spinner"></span> }
        </button>
      </div>
    </form>
  </div>

  async function handleApprobe(data: TSubmit) {
    try {
      await sendApprove({
        functionName: "approve",
        args: [contract?.address, BigInt(data.ammount)]
      });
    } catch (e) {
      console.warn(e)
    }
  }
}

export default Zkatm
