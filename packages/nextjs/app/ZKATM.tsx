'use client'
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type TSubmit = {
  ammount: string
}
function ZKATM({className, ...props}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const { handleSubmit, register } = useForm<TSubmit>()
  const { data: grettings, isSuccess: success } = useScaffoldReadContract({
    contractName: "ZKATM_Token",
    functionName: "greeting",
    query: {
      retry: false,
    },
  });

  const { writeContractAsync: sendApprove, isPending } = useScaffoldWriteContract("ZKATM_Token");

  return  <div {...props} className={clsx("card bg-base-100 h-fit w-auto max-w-1/2 shadow-xl rounded-xl rounded-t-none", className)}>
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
      <h2 className="card-title text-lg md:text-2xl">Bienvenido al Mixer ZKATM</h2>

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text"> Cantidad de tokens (ZKATM) para operar</span>
        </div>
        <div className="input input-bordered flex items-center gap-2">
          <input required {...register('ammount', { required: true, disabled: !success })} type="text" className="grow bg-inherit" placeholder="Escriba la cantidad" />
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
        args: ["0xDA6fD1A6D5CC9aAdA5D5a8475fD59865a56CE7A9", BigInt(data.ammount)]
      });
    } catch (e) {
    }
  }
}


export default ZKATM
