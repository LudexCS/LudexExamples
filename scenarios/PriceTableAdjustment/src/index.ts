import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";

import * as ludex from "ludex";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 4000;

app.use(cors());

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

  const relayer = 
    ludex.relay.createLudexRelayMaster(
      ludexConfig,
      ludex.Address.create(contracts["ERC2771Forwarder"].address),
      wallet);

  app.post("/api/relay", async (req: Request, res: Response) => {
    const relayRequest = ludex.relay.deserializeRelayRequest(req.body);
    
    console.log("getting relay request");

    await
      relayer.acceptRequest(
        relayRequest,
        (args) => {
          console.log(`args: ${JSON.stringify(args)}`);
          res.json({ args });
        },
        (error) => {
          console.log(`error: ${error.message}`);
          res.status(500).json({ error: error.message });
        });
  });
}
 
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, async () => {
  await init();
  console.log(`Server running at http://localhost:${port}`);
});
