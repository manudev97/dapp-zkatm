'use client'

import "@rainbow-me/rainbowkit/styles.css";
import "~~/styles/globals.css";
import clsx from "clsx";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const AtmLayout = ({ children }: { children: React.ReactNode }) => {
    const { data: gretting, isSuccess: success } = useScaffoldReadContract({
    contractName: "ATM",
    functionName: "greeting",
    query: {
      retry: false
    }
  });

  return <div className="grid place-items-center h-full p-4">
    <div className={clsx("card bg-base-100 shadow-xl rounded-xl")}>
      <figure className="overflow-visible relative max-h-[16rem] bg-gray-300">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/crypto-atm-machine-4292746-3562233.png?f=webp"
          alt="ZKATM"
          className="rounded-xl aspect-video"
        />
      <p className={clsx("top-0 right-4 absolute badge badge-primary transition delay-300 duration-500", { "opacity-0": !success, "opacity-100": success, })} >
          {gretting}
      </p>
      { !success && <span className={clsx("top-0 left-4 absolute loading loading-dots loading-lg text-info")}></span> }
      </figure>
      <div className="card-body">
        {children}
      </div>
    </div>
  </div>
};

export default AtmLayout;
