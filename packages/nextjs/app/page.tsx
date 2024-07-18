"use client";
import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {

  return (
    <div className="grid h-full place-items-center text-5xl">
      <div className="flex gap-2 flex-col items-center">
        <h1> Welcome to Mixer ATM </h1>
        <div className="space-x-2">
          <Link href='/zkatm' className="btn btn-outline btn-success">ZKATM</Link>
          <Link href='/atm/deposit' className="btn btn-outline btn-success">ATM Deposit</Link>
          <Link href='/atm/whitedraw' className="btn btn-outline btn-success">ATM Whitedraw</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

