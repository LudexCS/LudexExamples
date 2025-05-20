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
    const connection = await ludex.BrowserWalletConnection.create(chainConfig);

    const signer = await connection.getSigner();

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

document.getElementById("claim")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const connection = await ludex.BrowserWalletConnection.create(chainConfig);

    const signer = await connection.getSigner();

    const profitEscrow =
        ludex
        .facade
        .createWeb3UserFacade(
            chainConfig,
            ludexConfig,
            signer)
        .metaTXAcessProfitEscrow();
            
    const itemID = (function () {
        const idText = 
            (document.getElementById("itemID") as HTMLInputElement)?.value;
        if (!idText)
        {
            throw new Error("No input itemID given");
        }
        return BigInt(idText);
    })();

    const relayRequest = 
        await profitEscrow.claimRequest(
            itemID, 
            ludex.Address.create(tokenAddress),
            await connection.getCurrentAddress(),
            3000000n);

    const relayResponse = 
        await fetch("/api/relay", {
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
});