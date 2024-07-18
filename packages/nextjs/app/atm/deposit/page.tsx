'use client'

import { NextPage } from "next"
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import CopyToClipboard from "react-copy-to-clipboard";
import { DocumentDuplicateIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useCallback, useState } from "react";

const commitmentNames = [
  "nullifier", "secret", "comminent", "nullifierHash"
] as const

type TDeposit = {
  commitment: `0x${string}`
  ammount: string
}

const AtmDeposit: NextPage = () => {
  const { handleSubmit, register } = useForm<TDeposit>()
  const { data: generateCommitment, isSuccess: commitment_success, refetch: comitment_refetch, isRefetching: comitment_isRefetch, } = useScaffoldReadContract({
    contractName: "ATM",
    functionName: "generateCommitment",
    query: {
      retry: false
    }
  });

  const { data: nextIndex, refetch: nextIndex_refetch } = useScaffoldReadContract({
    contractName: "ATM",
    functionName: "nextIndex",
    query: {
      retry: false
    }
  });

  const { writeContractAsync: sendAction } = useScaffoldWriteContract("ATM");

  const handleGenerate = useCallback(_handleGenerate, [comitment_isRefetch])

  const [ newIndex, setNewIndex ] = useState(false)

  return <>
      <h2 className="card-title text-lg md:text-2xl">Deposito ATM</h2>

      <div role="alert" className={clsx("alert", {"alert-success": newIndex, "alert-info": !newIndex})} >
        <InformationCircleIcon
          className="text-xl font-normal text-white size-6"
        />
        <h4>nextIndex: {nextIndex} </h4>
        <CopyToClipboard
          text={"" + nextIndex}
        >
          <DocumentDuplicateIcon
              className="text-xl font-normal text-white h-5 w-5 cursor-pointer"
              aria-hidden="true"
            />
        </CopyToClipboard>
      </div>

      <button onClick={handleGenerate} className={clsx("btn w-fit")}>
        Generar Comminent
        { comitment_isRefetch && <span className="loading loading-spinner"></span> }
      </button>
      <ul className="[&>li]:flex [&>li]:gap-2 list-disc">
      { commitment_success ? generateCommitment?.map( (commitment, index) => (
        <li key={commitment}>
          <span className="font-bold"> {commitmentNames?.[index]} </span>
          <span> {commitment} </span>
          <CopyToClipboard
            text={commitment}
          >
            <DocumentDuplicateIcon
              className="text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
              aria-hidden="true"
            />
          </CopyToClipboard>
        </li>
      ) ) : 
        Array.from({ length: 4 })?.map( (_, index) => (
          <li key={index} className="w-full">
            <span className="font-bold"> {commitmentNames?.[index]} </span>
            <div className="skeleton h-4 w-2/3"></div>
            <div className="skeleton size-4"></div>
          </li>
        ) )
      }
      </ul>

    <form className="space-y-2" onSubmit={handleSubmit(handleDeposit)}>
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text"> Compromiso </span>
        </div>
        <div className="input input-bordered flex items-center gap-2">
          <input {...register('commitment')} required type="text" className="grow bg-inherit" placeholder="Escriba el compromiso" />
        </div>
      </label>

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text"> Cantidad de tokens (ATM) para operar</span>
        </div>
        <div className="input input-bordered flex items-center gap-2">
          <input {...register('ammount')} required type="text" className="grow bg-inherit" placeholder="Escriba la cantidad" />
          <span className="badge badge-info">wei</span>
        </div>
      </label>

      <div className="card-actions">
        <button 
          type="submit"
          className="md:ms-auto w-full md:w-auto btn btn-primary text-white text-base"
        >
        Depositar
        </button>
      </div>
    </form>
  </>

  async function _handleGenerate() {
    if(comitment_isRefetch) return;
    await comitment_refetch()
  }

  async function handleDeposit(data: TDeposit) {
    try {
      await sendAction({
        functionName: "deposit",
        args: [data.commitment, BigInt(data.ammount)]
      });
      await nextIndex_refetch()
      setNewIndex((current) => !current)
    } catch (e) {
      console.error(e)
    }
  }
}

export default AtmDeposit
