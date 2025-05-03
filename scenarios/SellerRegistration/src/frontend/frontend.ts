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

let contractsMap: Record<string, {address: string; abi: any}>;
let ludexConfig: ludex.configs.LudexConfig;

window.onload = async () => {
  const res = await fetch("http://localhost:3000/contracts");
  contractsMap = await res.json();

  ludexConfig = {
    storeAddress: contractsMap["Store"].address,
    priceTableAddress: contractsMap["PriceTable"].address,
    ledgerAddress: contractsMap["Ledger"].address,
    sellerRegistryAddress: contractsMap["SellerRegistry"].address,
    itemRegistryAddress: contractsMap["ItemRegistry"].address
  };

  document
  .getElementById("tokenAddressDisplay")!
  .textContent = contractsMap["MockUSDC"].address;
};

document.getElementById("register")?.addEventListener("click", async () => {
  const connection = await ludex.BrowserWalletConnection.create(chainConfig);

  const signer = await connection.getSigner();

  const facade = 
    ludex
    .facade
    .createWeb3UserFacade(
      chainConfig, 
      ludexConfig,
      await connection.getSigner(),
      ludex.Address.create(contractsMap["ERC2771Forwarder"].address));
  
  const sellerRegistry = facade.metaTXAccessSellerRegistry();

  const tokenAddress = 
    (document.getElementById("tokenAddress") as HTMLInputElement)?.value;

  if (!tokenAddress)
  {
    alert("No token address");
    return;
  }

  const relayRequest = 
    await sellerRegistry.registerSellerRequest(
      [
        ludex.Address.create(tokenAddress)
      ],
      BigInt(3000000));

  const relayResponse = 
    await fetch ("/api/relay", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: ludex.relay.serializeRelayRequest(relayRequest)
    });

  const { args, error } = await relayResponse.json();
    
  console.log(args);

  if (error)
  {
    console.error (error.message);
    return;
  }

  const isSucess: boolean = relayRequest.onResponse(...args);
  document.getElementById("registerResult")!.innerText = String(isSucess);
});

document.getElementById("isActiveSeller")?.addEventListener("click", async () =>{
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  const facade = 
    ludex.facade.createWeb2UserFacade(chainConfig, ludexConfig, provider);

  const sellerRegistry = facade.readonlyAccessSellerRegistry();

  const sellerAddress = 
    (document.getElementById("sellerAddress") as HTMLInputElement)?.value;
  
  const isActive = 
    await sellerRegistry.isActiveSeller(ludex.Address.create(sellerAddress));
  
  document.getElementById("isActiveSellerResult")!.innerText = String(isActive);
});