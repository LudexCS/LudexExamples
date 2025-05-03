import express, { Request, Response } from "express";
import path from "path";

import * as ludex from "ludex";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 4000;

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

async function init()
: Promise<void>
{
  const contracts: Contracts = await (
    fetch("http://localhost:3000/contracts")
    .then(res => res.json()));

  const chainConfig = createChainConfig();
  const ludexConfig = createLudexConfig(contracts);
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  if (process.env.PRIVATE_KEY === undefined)
  {
    console.error("No private key configured");
    return;
  }

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const sellerRegistry = 
    new ethers.Contract(
      contracts["SellerRegistry"].address,
      contracts["SellerRegistry"].abi,
      wallet);
  console.log(
    await sellerRegistry.isTrustedForwarder(contracts["ERC2771Forwarder"].address));

  const relayer = 
    ludex.relay.createLudexRelayMaster(
      ludexConfig,
      ludex.Address.create(contracts["ERC2771Forwarder"].address),
      wallet);
    

  app.post("/api/relay", async (req: Request, res: Response) => {
    const relayRequest = ludex.relay.deserializeRelayRequest(req.body);

    console.log("Deserialized: ")
    console.log(`\tfrom: ${relayRequest.request.from}`)
    console.log(`\tto: ${relayRequest.request.to}`)
    console.log(`\tvalue: 
        ${relayRequest.request.value}
        (${typeof relayRequest.request.value})
        `)
    console.log(`\tgas: 
        ${relayRequest.request.gas}
        (${typeof relayRequest.request.gas})
        `)
    console.log(`\tnonce: 
        ${relayRequest.request.nonce}
        (${typeof relayRequest.request.nonce})
        `)
    console.log(`\tdata: ${relayRequest.request.data}`)
    console.log(`\tsignature: ${relayRequest.signature}`)
    console.log(`\tevent: ${relayRequest.responseEvent}`)

    const sellerRegistryInterface = 
      new ethers.Interface(contracts["SellerRegistry"].abi);

    const decoded = 
      sellerRegistryInterface.decodeFunctionData(
        "registerSeller",
        relayRequest.request.data);
    console.log(decoded);

    console.log(`from: ${relayRequest.request.from}`);
    const result = await
      relayer.acceptRequest(
        relayRequest,
        (args) => res.json({ args }),
        (error) => res.status(500).json({ error: error.message }));
  });
}
 
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, async () => {
  await init();
  console.log(`Server running at http://localhost:${port}`);
});
