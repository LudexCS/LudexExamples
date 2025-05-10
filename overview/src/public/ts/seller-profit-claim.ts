import * as ludex from "ludex";
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

    const payment =
        ludex
        .facade
        .createWeb3UserFacade(
            chainConfig,
            ludexConfig,
            signer)
        .metaTXAccessPaymentProcessor();

    const tokenAddress = await (async function () {
        const response = await fetch("/api/mock-usdc-address");
        const { usdcAddress } = await response.json();
        return usdcAddress;
    })();   

    document.getElementById("balance")!.innerText = 
        (await payment.getEscrowBalance(ludex.Address.create(tokenAddress)))
        .toString();
});

document.getElementById("claim")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const connection = await ludex.BrowserWalletConnection.create(chainConfig);

    const signer = await connection.getSigner();

    const payment =
        ludex
        .facade
        .createWeb3UserFacade(
        chainConfig,
        ludexConfig,
        signer)
        .metaTXAccessPaymentProcessor();

    const relayRequest = 
        await payment.claimRequest(
            ludex.Address.create(tokenAddress), 
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
})