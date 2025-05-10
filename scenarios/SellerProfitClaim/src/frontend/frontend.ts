import * as ludex from "ludex";
import { ethers } from "ethers";

const chainConfig: ludex.configs.ChainConfig = {
  chainId: `0x${(31337).toString(16)}`,
  chainName: "Hardhat",
  rpcUrls: ["http://localhost:8545"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18
  }
};

let ludexConfig: ludex.configs.LudexConfig;
let tokenAddress: string;

window.onload = async () => {
  const res = await fetch("http://localhost:3000/contracts");
  const contractsMap = await res.json();
  
  ludexConfig = { 
    paymentProcessorAddress: contractsMap["PaymentProcessor"].address,
    forwarderAddress: contractsMap["ERC2771Forwarder"].address
  };

  tokenAddress = contractsMap["MockUSDC"].address;
};

document.getElementById("showBalance")?.addEventListener("click", async () => {
  const connection = await ludex.BrowserWalletConnection.create(chainConfig);

  const signer = await connection.getSigner();

  const payment =
    ludex
    .facade
    .createWeb3UserFacade(
      chainConfig,
      ludexConfig,
      signer)
    .metaTXAccessPaymentProcessor();

  document.getElementById("balance")!.innerText = 
    (await payment.getEscrowBalance(ludex.Address.create(tokenAddress)))
    .toString();
});

document.getElementById("claim")?.addEventListener("click", async () => {
  const connection = await ludex.BrowserWalletConnection.create(chainConfig);

  const signer = await connection.getSigner();

  const payment =
    ludex
    .facade
    .createWeb3UserFacade(
      chainConfig,
      ludexConfig,
      signer)
    .metaTXAccessPaymentProcessor();

  const relayRequest = 
      await payment.claimRequest(
          ludex.Address.create(tokenAddress), 
          3000000n);

  const relayResponse = 
      await fetch("http://localhost:4000/api/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: ludex.relay.serializeRelayRequest(relayRequest)
      });

  const { args, error } = await relayResponse.json();

  if (error)
  {
    console.error(`message: ${error}`);
  }

  const tokenClaimed = relayRequest.onResponse(args);

  document.getElementById("claimResult")!.innerText = tokenClaimed.toString();
})