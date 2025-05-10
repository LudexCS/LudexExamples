import * as ludex from "ludex";
import { chainAndLudexConfig } from "./configurations";

async function showBalance () 
{
    const [chainConfig, _] = await chainAndLudexConfig();

    const response = await fetch("/api/mock-usdc-address");
    const { usdcAddress } = await response.json();

    const connection = await ludex.BrowserWalletConnection.create(chainConfig);

    const signer = await connection.getSigner();
    const userAddress = await signer.getAddress().then(ludex.Address.create);

    const provider = signer.provider;
    if (!provider)
    {
        throw new Error("No provider of signer");
    }

    const balance = await
        ludex.balanceOfUSDC(
            ludex.Address.create(usdcAddress),
            userAddress,
            provider);

    document.getElementById("currentBalance")!.innerText = balance.toString();
}

window.onload = showBalance;

document.getElementById("get")?.addEventListener("click", async() => {
    const [chainConfig, _] = await chainAndLudexConfig();

    const usdcResponse = await fetch("/api/mock-usdc-address");
    const { usdcAddress } = await usdcResponse.json();

    const connection = await ludex.BrowserWalletConnection.create(chainConfig);
    const address = await (async function () {
        const signer = await connection.getSigner();
        return await signer.getAddress();
    })();

    await fetch ("/api/giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({userAddress: address})
    });

    await showBalance();
})