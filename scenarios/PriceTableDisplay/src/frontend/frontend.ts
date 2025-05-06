import * as ludex from "ludex";
import { ethers } from "ethers";

function createChainConfig (): ludex.configs.ChainConfig
{
  return {
    chainId: `0x${(31337).toString(16)}`,
    chainName: "Hardhat Testnet",
    rpcUrls: ["http://localhost:8545"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    }
  }
};

type Contracts = Record<string, {address: string; abi: any}>;

function createLudexConfig(contracts: Contracts): ludex.configs.LudexConfig
{
  return {
    storeAddress: contracts["Store"].address,
    ledgerAddress: contracts["Ledger"].address,
    priceTableAddress: contracts["PriceTable"].address,
    sellerRegistryAddress: contracts["SellerRegistry"].address,
    itemRegistryAddress: contracts["ItemRegistry"].address
  };
}

document.getElementById("show")?.addEventListener("click", async () => {
  const itemID = 
    (document.getElementById("itemID") as HTMLInputElement)?.value;
  
  if (itemID === undefined)
  {
    alert("No item ID");
    return;
  }

  const contracts = 
    await fetch("http://localhost:3000/contracts").then(res => res.json());

  const chainConfig = createChainConfig();
  const ludexConfig = createLudexConfig(contracts);

  const facade = 
    ludex.facade.createWeb2UserFacade(
      chainConfig, 
      ludexConfig,
      new ethers.JsonRpcProvider("http://localhost:8545"));

  const priceTable = facade.readonlyAccessPriceTable();

  const usdPrice = await
    priceTable.getPriceUsd(BigInt(itemID))
    .then(String);

  const priceInfoList = await (
    priceTable.getPriceInfoList(BigInt(itemID))
    .then(infoList => infoList.map(info => ({
      token: info.token.stringValue,
      tokenAmount: info.tokenAmount.toString()
    }))));
    
  console.log(priceInfoList.length);

  const displayString = 
    JSON.stringify({usdPrice: usdPrice, ...priceInfoList}, null, '\t');
  
  document.getElementById("result")!.textContent = displayString;
});