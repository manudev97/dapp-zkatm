'use client'

import { NextPage } from "next"
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useCallback } from "react";
import { generateMerkleProof } from "~~/utils/generateMerkleProof";
import { useMutation, useSuspenseQueries } from "@tanstack/react-query";
import type { PublicSignals, Groth16Proof } from 'snarkjs'

type TWhitedraw = {
  root?: `0x${string}`
  ammount?: number
  nextIndex?: number
  secret?: `0x${string}`
  nullifierHash?: `0x${string}`
  nullifier?: `0x${string}`
}

const AtmWhitedraw: NextPage = () => {
  const { data: root  } = useScaffoldReadContract({
    contractName: "ATM",
    functionName: "getLastRoot",
    query: {
      retry: false
    }
  });

  const { data: nextIndex  } = useScaffoldReadContract({
    contractName: "ATM",
    functionName: "nextIndex",
    query: {
      retry: false
    }
  });

  const { data: levels } = useScaffoldReadContract({
    contractName: "ATM",
    functionName: "levels",
    query: {
      retry: false
    }
  });

  const { data: ATM } = useScaffoldContract({
    contractName: "ATM"
  })

  const zeros = useSuspenseQueries({
    queries: Array.from({ length: levels ?? 0 }).map( (_, index) => ({
      queryKey: ['zeros', index] ,
      queryFn: async () => {
        const res = await ATM?.read.zeros( [BigInt(index)] )
        return res
      }
    })),
    combine: (data) => {
      return data.map( ({ data }) => ( data ) )
    }
  }) as Array<`0x${string}`>

  const filledSubtree = useSuspenseQueries({
    queries: Array.from({ length: levels ?? 0 }).map( (_, index) => ({
      queryKey: ['filledSubtree', index] ,
      queryFn: async () => {
        const res = await ATM?.read.filledSubtrees( [BigInt(index)] )
        return res
      }
    })),
    combine: (data) => {
      return data.map( ({ data }) => (data) )
    }
  }) as Array<`0x${string}`>

  const { handleSubmit, register, watch } = useForm<TWhitedraw>({
    values: {
      root: root,
      nextIndex: nextIndex,
    }
  })

  const handleTest = useCallback(_handleTest, [zeros, filledSubtree, levels])

  const { data: dataProve, isSuccess, isPending, isError, mutate: handleMutationProve } = useMutation({
    mutationKey: ['snarkjs-fullProve'],
    mutationFn: handleProve
  })

  const { writeContractAsync: sendAction } = useScaffoldWriteContract("ATM");

  return <>
      <h2 className="card-title text-lg md:text-2xl">Retiro ATM</h2>

      <form id="whitedraw" className="space-y-2" onSubmit={handleSubmit(handleWhitedraw)}>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text"> root </span>
          </div>
          <div className="input input-bordered flex items-center gap-2">
            <input {...register('root', { required: true })} required type="text" className="grow bg-inherit" placeholder="Escriba el root" />
          </div>
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text"> index </span>
          </div>
          <div className="input input-bordered flex items-center gap-2">
            <input {...register('nextIndex', { required: true })} required type="text" className="grow bg-inherit" placeholder="Escriba el index" />
          </div>
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text"> secret </span>
          </div>
          <div className="input input-bordered flex items-center gap-2">
            <input {...register('secret', { required: true })} required type="text" className="grow bg-inherit" placeholder="Escriba el secret" />
          </div>
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text"> nullifierHasher </span>
          </div>
          <div className="input input-bordered flex items-center gap-2">
            <input {...register('nullifierHash', { required: true })} required type="text" className="grow bg-inherit" placeholder="Escriba el nullifierHash" />
          </div>
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text"> nullifier </span>
          </div>
          <div className="input input-bordered flex items-center gap-2">
            <input {...register('nullifier', { required: true })} required type="text" className="grow bg-inherit" placeholder="Escriba el nullfier" />
          </div>
        </label>
        
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text"> Cantidad de tokens (ATM) para operar</span>
          </div>
          <div className={clsx("input input-bordered flex items-center gap-2", { "input-disabled": true })}>
            <input {...register('ammount', { required: true, disabled: isSuccess })} disabled={!isSuccess} required type="number" className="grow bg-inherit" placeholder="Escriba la cantidad" />
            <span className="badge badge-info">wei</span>
          </div>
        </label>
      </form>

      <div className="card-actions">
        <button onClick={handleTest} className={clsx("btn md:ms-auto", { "btn-success": isSuccess, "btn-info": !isSuccess, "btn-error": isError })}>
          Generar Prueba
          { isPending && <span className="loading loading-spinner"></span> }
        </button>
        <button
          form="whitedraw"
          type="submit"
          disabled={!isSuccess}
          className="w-full md:w-auto btn btn-primary text-white text-base"
        >
        Retirar
        </button>
      </div>
  </>

  type TRes = { proof: Groth16Proof, publicSignals: PublicSignals }
  async function handleProve( request: Omit<TWhitedraw, "ammount"> & Record< "zeros" | "filledSubtree", Array<`0x${string}`> > & { levels?: number } ): Promise<TRes>  {
    if(typeof request.levels === "undefined" || typeof request.nextIndex === "undefined") throw new Error("request not be available")
    const data = generateMerkleProof({ 
      nextIndex: request.nextIndex,
      zeros: request.zeros,
      levels: request.levels,
      filledSubtree: request.filledSubtree
    })

    const input: Omit<TWhitedraw, "ammount" | 'nextIndex'> & typeof data = {
      pathIndices: data.pathIndices,
      pathElements: data.pathElements,
      root: request.root,
      nullifierHash: request.nullifierHash,
      nullifier: request.nullifier,
      secret: request.secret
    } as const


    const res = await fetch('/atm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    })

    return await res.json() as TRes
  }

  function _handleTest() {
    handleMutationProve({
      filledSubtree,
      zeros,
      levels,
      secret: watch('secret'),
      nullifier: watch('nullifier'),
      nullifierHash: watch('nullifierHash'),
      root: watch('root'),
      nextIndex: watch('nextIndex')
    })
  }

  async function handleWhitedraw(data: TWhitedraw) {
    if(!dataProve?.proof || !data.ammount) throw new Error('prof not be available')
    const a = [ BigInt(dataProve.proof.pi_a[0]), BigInt(dataProve.proof.pi_a[1]) ] as const
    const b = [ 
      [ BigInt(dataProve.proof.pi_b[0][0]), BigInt(dataProve.proof.pi_b[0][1]) ] as const,  
      [ BigInt(dataProve.proof.pi_b[1][0]), BigInt(dataProve.proof.pi_b[1][1]) ] as const
    ] as const
    const c = [ BigInt(dataProve.proof.pi_c[0]), BigInt(dataProve.proof.pi_c[1]) ] as const
    try {
      await sendAction({
        functionName: "withdraw",
        args: [ BigInt(data.ammount), { a, b, c } ,data.root, data.nullifierHash ],
      });
      console.log( { ammount: BigInt(data.ammount), prove: { a, b, c } ,root: data.root, nullifierHash :data.nullifierHash } )
    } catch (e) {
      console.warn(e)
    }
  }
}

export default AtmWhitedraw
