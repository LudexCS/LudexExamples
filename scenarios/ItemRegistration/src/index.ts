import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";

import * as ludex from "ludex";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fnv1a from "fnv1a";

type Contracts = Record<string, {address: string; abi: any}>;

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

dotenv.config();

const app = express();
const port = 4000;

app.use(cors());


app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/register", async (req: Request, res: Response) => {
  const data = req.body;
  console.log(`data: ${JSON.stringify(data)}`);
  const itemName: string = data.itemName;
  const seller: ludex.Address = ludex.Address.create(data.seller);
  const sharers: bigint[] = 
    (data.sharers as string[]).map(entry => BigInt(entry))
  const itemPrice: bigint = BigInt(data.itemPrice);
  const shareTerms: number[] = 
    (data.shareTerms as string[]).map(entry => Number(entry));

  if (process.env.PRIVATE_KEY === undefined)
  {
    console.error("No private key configured");
    return;
  }

  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const contracts = await (
    fetch("http://localhost:3000/contracts")
    .then(res => res.json()));

  const facade = 
    ludex.facade.createServiceFacade(
      createChainConfig(),
      createLudexConfig(contracts),
      wallet);

  const itemRegistry = facade.serviceAccessItemRegistry();

  const nameHash = await itemRegistry.getNameHash(itemName);
  const shares: Array<[bigint, number]> = [];

  for (const [index, shareTerm] of shareTerms.entries())
  {
    const shareTermID = 
      BigInt(fnv1a(`${nameHash}@shareTerm@${index}@${shareTerm}`));
    
    shares.push([shareTermID, shareTerm]);
  }

  const [itemID, sharerIDs] = 
    await itemRegistry.registerItem(
      nameHash,
      seller,
      sharers,
      itemPrice,
      shares);
    
  res.json({
    itemID: itemID.toString(),
    sharerIDs: sharerIDs.map(entry => entry.toString())
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});