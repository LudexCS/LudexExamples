import * as ludex from "ludex";
import { ethers } from "ethers";

import path from "path";
import fs from "fs";
import dotenv from "dotenv";

import express, { Request, Response } from "express";
import cors from "cors";
import { getAPIGiveaway, postAPIContracts } from "./api/contracts";
import { postAPIRelay } from "./api/relay";
import { APIAttachment } from "./api/api-attachment";
import { register } from "module";
import { postAPIRegisterItem } from "./api/register-item";
import { postConfigs } from "./api/configs";

dotenv.config();

const app = express();
const PORT = 3000;

if (!process.argv[2])
{
    console.error("Error: No network given");
}

const network = process.argv[2];

const version = (function () {
    if (process.argv[3])
    {
        return Number(process.argv[3]);
    }
    else
    {
        return undefined;
    }
}) ();

const contracts = (function () {
    const data: any[] = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, `./deployments/deployment.${network}.json`),
            "utf8"));
    
    const deployments = 
        ((version) ? data[version] : data[data.length - 1]).deployments;
    
    return deployments;
}) ();

const rpcURL = `RPC_URL_${network.toUpperCase()}`;

const wallet = 
    ethers.Wallet.fromPhrase(
        process.env.MNEMONIC!,
        new ethers.JsonRpcProvider(process.env[rpcURL]));

const chainConfigPublic: ludex.configs.ChainConfig = 
    JSON.parse(
        fs.readFileSync(
            path.join(__dirname, `./service-configs/service.${network}.config.json`),
            "utf8"))
    .chainConfig;

console.log(
    "Chain Config(public): \n" + JSON.stringify(chainConfigPublic, null, '\t'));

const chainConfigPrivate: ludex.configs.ChainConfig = {
    ...chainConfigPublic,
    rpcUrls: [process.env[rpcURL] as string]
};
console.log(
    "Chain Config(private): \n" + JSON.stringify(chainConfigPrivate, null, '\t'));

const ludexConfig: ludex.configs.LudexConfig = {
    sellerRegistryAddress: contracts.SellerRegistry.address,
    itemRegistryAddress: contracts.ItemRegistry.address,
    priceTableAddress: contracts.PriceTable.address,
    profitEscrowAddress: contracts.ProfitEscrow.address,
    paymentProcessorAddress: contracts.PaymentProcessor.address,
    ledgerAddress: contracts.Ledger.address,
    storeAddress: contracts.Store.address,
    forwarderAddress: contracts.ERC2771Forwarder.address
};

console.log(
    "Ludex Config: \n" + JSON.stringify(ludexConfig, null, '\t'));

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/mock-usdc-address", async (_: Request, res: Response) => {
    if (!contracts.MockUSDC)
    {
        res.status(404).send("No MockUSDC contract deployed");
        return;
    }

    res.json({usdcAddress: contracts.MockUSDC.address});
});

app.post("/api/giveaway", async (req: Request, res: Response) => {
    const { userAddress } = req.body;

    await ludex.giveawayUSDC(
        ludex.Address.create(contracts.MockUSDC.address), 
        ludex.Address.create(userAddress), 
        wallet);

    res.status(204).send();
});

(new APIAttachment(
    app, 
    chainConfigPublic, 
    chainConfigPrivate, 
    ludexConfig, 
    wallet))
.attach(postConfigs())
.attach(postAPIContracts(contracts))
.attach(getAPIGiveaway(contracts))
.attach(postAPIRelay())
.attach(postAPIRegisterItem());

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});