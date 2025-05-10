import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";

window.onload = async () => {
    const response = await fetch("/api/mock-usdc-address");

    const { usdcAddress } = await response.json();

    document.getElementById("tokenAddress")!.innerText = usdcAddress;
}

function getInputValue(id: string): string {
    return (document.getElementById(id) as HTMLInputElement)?.value ?? "";
}

function getBigIntValue(id: string): bigint {
    return BigInt(getInputValue(id) || "0");
}

function validateTokenAddress(tokenAddress: string): boolean {
    if (!tokenAddress) {
        alert("No token address");
        return false;
    }
    return true;
}

function validateDecimals(decimals: bigint): boolean {
    if (decimals < 4n) {
        alert("Precision too low");
        return false;
    }
    if (decimals > 32n) {
        alert("Precision too big");
        return false;
    }
    return true;
}

async function getPriceTable(): Promise<ludex.Access.Admin.IPriceTable> {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const connection = await ludex.BrowserWalletConnection.create(chainConfig);
    const facade = 
        ludex.facade.createAdminFacade(
            chainConfig, 
            ludexConfig, 
            await connection.getSigner());
    return facade.adminAccessPriceTable();
}

// Add a new payment channel with exchange rate and decimals
document.getElementById("add")?.addEventListener("click", async () => {
    const priceTable = await getPriceTable();
    const tokenAddress = getInputValue("addPaymentChannel");
    if (!validateTokenAddress(tokenAddress)) return;

    const usdToToken = getBigIntValue("addInputRate");
    if (usdToToken <= 0n) {
        alert("Cannot add token which has no value");
        return;
    }

    const decimals = getBigIntValue("addInputDecimals");
    if (!validateDecimals(decimals)) return;

    await priceTable.addPaymentChannel(
        ludex.Address.create(tokenAddress),
        usdToToken * 10n ** decimals
    );
    });

    // Remove a payment channel by token address
    document.getElementById("remove")?.addEventListener("click", async () => {
    const priceTable = await getPriceTable();
    const tokenAddress = getInputValue("removePaymentChannel");
    if (!validateTokenAddress(tokenAddress)) return;

    const isSuccess = 
        await priceTable.removePaymentChannel(ludex.Address.create(tokenAddress));
    console.log(isSuccess
        ? `Successfully removed token: ${tokenAddress}`
        : `Could not remove token: ${tokenAddress}`);
    });

    // Retrieve the current exchange rate for a given token address
    document.getElementById("get")?.addEventListener("click", async () => {
        const priceTable = await getPriceTable();
        const tokenAddress = getInputValue("getExchangeRateOf");
        if (!validateTokenAddress(tokenAddress)) return;

        const usdToToken = 
            await priceTable.getExchangeRateOf(ludex.Address.create(tokenAddress));
        document.getElementById("rate")!.innerText = usdToToken.toString();
    });

    // Change the exchange rate for an existing token
    document.getElementById("change")?.addEventListener("click", async () => {
    const priceTable = await getPriceTable();
    const tokenAddress = getInputValue("changeExchangeRate");
    if (!validateTokenAddress(tokenAddress)) return;

    const usdToToken = getBigIntValue("changeInputRate");
    const decimals = getBigIntValue("changeInputDecimals");
    if (!validateDecimals(decimals)) return;

    const prevUSDToToken = await priceTable.changeExchangeRate(
        ludex.Address.create(tokenAddress),
        usdToToken * 10n ** decimals
    );
    document.getElementById("prev")!.innerText = prevUSDToToken.toString();
});
