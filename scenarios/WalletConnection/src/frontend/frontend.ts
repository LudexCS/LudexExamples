import * as ludex from "ludex";
import { ethers } from "ethers";

const chainConfig: ludex.configs.ChainConfig = {
  chainId: `0x${(31337).toString(16)}`,
  chainName: "Hardhat Testnet",
  rpcUrls: ["http://localhost:8545"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18
  }
}; 

window.onload = async() => {
  const connection = await ludex.BrowserWalletConnection.create(chainConfig);
  connection
  .getSigner()
  .then(signer => signer.getAddress())
  .then(address => {alert(address); console.log(address);});
};
