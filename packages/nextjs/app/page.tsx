"use client";
import type { NextPage } from "next";
import ZKATM from "./ZKATM";
import ATM from "./ATM";

const Home: NextPage = () => {

  return (
    <div className="md:py-10 md:w-full">
      <div role="tablist" className="md:mx-auto tabs tabs-lifted w-1/2 p-10">
        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="ATM" defaultChecked />
        <div className="tab-content" role="tabpanel"><ATM /></div>

        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="ZKATM" />
        <div className="tab-content" role="tabpanel" ><ZKATM /></div>
      </div>
    </div>
  );
};

export default Home;

