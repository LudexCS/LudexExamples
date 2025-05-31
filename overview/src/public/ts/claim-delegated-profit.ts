import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";

let tokenAddress: string;
window.onload = async () => {
    const response = await fetch("/api/mock-usdc-address");
    const { usdcAddress } = await response.json();
    tokenAddress = usdcAddress;
};

document.getElementById("showBalance")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();

    const profitEscrow = 
        ludex
        .facade
        .createWeb2UserFacade(
            chainConfig,
            ludexConfig)
        .readonlyAccessProfitEscrow();

    const tokenAddress = await (async function () {
        const response = await fetch("/api/mock-usdc-address");
        const { usdcAddress } = await response.json();
        return usdcAddress;
    })();   

    const itemID = (function () {
        const idText = 
            (document.getElementById("itemID") as HTMLInputElement)?.value;
        if (!idText)
        {
            throw new Error("No input itemID given");
        }
        return BigInt(idText);
    })();

    document.getElementById("balance")!.innerText = 
        (await profitEscrow.getBalanceFor(
            itemID, 
            ludex.Address.create(tokenAddress)))
        .toString();
});

document.getElementById("showPendingProfit")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();

    const profitEscrow = 
        ludex
        .facade
        .createWeb2UserFacade(chainConfig, ludexConfig)
        .readonlyAccessProfitEscrow();

    const itemID = (function () {
        const idText = 
            (document.getElementById("itemID") as HTMLInputElement)?.value;
        if (!idText)
        {
            throw new Error("No input itemID given");
        }
        return BigInt(idText);
    })();

    const pendingProfit = await (
        profitEscrow.getPendingProfit(
            itemID,
            ludex.Address.create(tokenAddress)));

    document.getElementById("pendingProfit")!.innerText = 
        pendingProfit.toString();
})

document.getElementById("claim")?.addEventListener("click", async () => {

    const itemID = (function () {
        const idText = 
            (document.getElementById("itemID") as HTMLInputElement)?.value;
        if (!idText)
        {
            throw new Error("No input itemID given");
        }
        return BigInt(idText);
    })();

    const sellerID = (function () {
        const idText = 
            (document.getElementById("sellerID") as HTMLInputElement)?.value;
        if (!idText)
        {
            throw new Error("No input sellerID given");
        }
        return BigInt(idText);
    })();

    const response = await fetch("/api/delegate-claim-profit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            tokenAddress: tokenAddress,
            itemID: itemID.toString(),
            sellerID: sellerID.toString()
        })
    });

    if (!response.ok)
    {
        const msg = await response.text();
        console.log(`Failed: ${msg}`);
    }

    const resultData = await response.json();
    const amount = resultData.amount;

    document.getElementById("claimResult")!.innerText = amount.toString();
});