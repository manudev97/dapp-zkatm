'use client'

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import CopyToClipboard from "react-copy-to-clipboard";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

const commitmentNames = [
  "Nullifier", "Secret", "Comminent", "Nullifier Hasher"
] as const

type TDeposit = {
  commitment: `0x${string}`
  ammount: string
}
function ATM({ className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const { handleSubmit, register } = useForm<TDeposit>()
  const { data: generateCommitment, isSuccess: commitment_success, refetch, isRefetching, } = useScaffoldReadContract({
    contractName: "ATM",
    functionName: "generateCommitment",
    query: {
      retry: false
    }
  });

  const { data: gretting, isSuccess: gretting_success } = useScaffoldReadContract({
    contractName: "ATM",
    functionName: "greeting",
    query: {
      retry: false
    }
  });

  const { writeContractAsync: sendAction } = useScaffoldWriteContract("ATM");
  const [localCommitment, setLocalCommitment] = useState<typeof generateCommitment | null>(null);
  const [localGrettings, setLocalGretting] = useState<typeof gretting | null>(null);

  useEffect(() => {
    if (commitment_success && !isRefetching) {
      setLocalCommitment(generateCommitment);
    }
  }, [commitment_success, generateCommitment, isRefetching]);

  useEffect(() => {
    if (gretting_success) {
      setLocalGretting(gretting);
    }
  }, [gretting_success, gretting]);

  const handleGenerate = useCallback(_handleGenerate, [isRefetching])

  return <div {...props} className={clsx("card bg-base-100 shadow-xl rounded-xl rounded-t-none", className)}>
      <figure className="overflow-visible relative max-h-[16rem] bg-gray-300">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/crypto-atm-machine-4292746-3562233.png?f=webp"
          alt="ZKATM"
          className="rounded-xl aspect-video"
        />
      <p className={clsx("top-0 right-4 absolute badge badge-primary transition delay-300 duration-500") }
      >
          {localGrettings}
      </p>
      </figure>

      <div className="card-body">
        <h2 className="card-title text-lg md:text-2xl">Bienvenido al Mixer ATM</h2>

        <button onClick={handleGenerate} className={clsx("btn w-fit")}>
          Generar Comminent
          { isRefetching && <span className="loading loading-spinner"></span> }
        </button>
        <ul className="[&>li]:flex [&>li]:gap-2 list-disc">
        { localCommitment ? localCommitment?.map( (commitment, index) => (
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
    </div>
    </div>

  async function _handleGenerate() {
    if(isRefetching) return;
    await refetch()
  }

  async function handleDeposit(data: TDeposit) {
    try {
      await sendAction({
        functionName: "deposit",
        args: [data.commitment, BigInt(data.ammount)]
      });
    } catch (e) {
    }
  }
}

export default ATM

