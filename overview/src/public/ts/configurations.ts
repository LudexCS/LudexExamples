import * as ludex from "ludex";
import { ethers } from "ethers";

let chainConfig: ludex.configs.ChainConfig | null = null;
let ludexConfig: ludex.configs.LudexConfig | null = null;

export async function chainAndLudexConfig ()
: Promise<[ludex.configs.ChainConfig, ludex.configs.LudexConfig]>
{
    if (chainConfig !== null && ludexConfig !== null)
    {
        return [chainConfig, ludexConfig];
    }

    const response = await fetch("/api/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    console.log("Chain Config: \n" + JSON.stringify(data.chainConfig, null, '\t'));
    console.log("Ludex Config: \n" + JSON.stringify(data.ludexConfig, null, '\t'));

    chainConfig = data.chainConfig as ludex.configs.ChainConfig;
    ludexConfig = data.ludexConfig as ludex.configs.LudexConfig;

    return [chainConfig, ludexConfig];
}