import "@rainbow-me/rainbowkit/styles.css";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold-ETH 2 App",
  description: "ZKATM Mixer",
});

const ZkatmLayout = ({ children }: { children: React.ReactNode }) => {
  return (<div className="grid place-items-center h-full p-4">
    {children}
  </div>);
};

export default ZkatmLayout;
