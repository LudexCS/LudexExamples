import * as ludex from "ludex";
import { ethers } from "ethers";

import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

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
            path.join(__dirname, `../deployments/deployment.${network}.json`),
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

const serviceConfig = 
    JSON.parse(
        fs.readFileSync(
            path.join(__dirname, `../service-configs/service.${network}.config.json`),
            "utf8"));

const chainConfigPublic: ludex.configs.ChainConfig = serviceConfig.chainConfig;

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
    sellerProxyAddress: contracts.SellerProxy.address,
    purchaseProxyAddress: contracts.PurchaseProxy.address,
    forwarderAddress: contracts.ERC2771Forwarder.address
};

const profitEscrow = 
    ludex.facade
    .createServiceFacade(chainConfigPrivate, ludexConfig, wallet)
    .serviceAccessProfitEscrow();

const itemIDs =
    fs.readFileSync(
        "scripts/items-to-settle.txt", 
        "utf8")
    .split('\n')
    .map(entry => BigInt(entry));

const mainTokenAddress = 
    ludex.Address.create(serviceConfig.mainTokenAddress);

async function main() 
{
    const wholePendingProfit = 
        await profitEscrow.getWholePendingProfit(mainTokenAddress);

    console.log(`Whole Pending Profit: ${wholePendingProfit.toString()}`);

    var batch: bigint[] = [];
    for (var i = 0; i < itemIDs.length; i++)
    {
        batch.push(itemIDs[i]);
        if((i + 1) % 50 === 0 || i + 1 === itemIDs.length)
        {
            await profitEscrow.settlePendingProfit(mainTokenAddress, batch);
            batch = [];
        }
    }

    console.log("Pending Profit Settled");

    process.kill(0);
}

main();