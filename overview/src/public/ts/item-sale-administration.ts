import * as ludex from "ludex";
import { chainAndLudexConfig } from "./configurations";

function getItemID()
: bigint
{
    const rawitemID = 
        (document.getElementById("itemID") as HTMLInputElement)!.value;
    
    return BigInt(rawitemID);
}

document.getElementById("checkOnSale")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const itemID = getItemID();

    const itemRegistry = 
        ludex.facade
        .createWeb2UserFacade(chainConfig, ludexConfig)
        .readonlyAccessItemRegistry();

    document.getElementById("isOnSale")!.innerText = 
        String(await itemRegistry.checkOnSale(itemID));
});

document.getElementById("suspendSale")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const wallet = await ludex.BrowserWalletConnection.create(chainConfig);

    const itemRegistry =
        ludex.facade
        .createAdminFacade(chainConfig, ludexConfig, await wallet.getSigner())
        .adminAccessItemRegistry();

    const itemID = getItemID();

    const suspensions = await itemRegistry.suspendItemSale(itemID);

    document.getElementById("suspensions")!.innerText = 
        JSON.stringify(suspensions.map(entry => entry.toString()));
});

document.getElementById("resumeSale")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const wallet = await ludex.BrowserWalletConnection.create(chainConfig);

    const itemRegistry =
        ludex.facade
        .createAdminFacade(chainConfig, ludexConfig, await wallet.getSigner())
        .adminAccessItemRegistry();

    const itemID = getItemID();

    const resumedItems = await itemRegistry.resumeItemSale(itemID);

    document.getElementById("resumedItems")!.innerText = 
        JSON.stringify(resumedItems.map(entry => entry.toString()));
});