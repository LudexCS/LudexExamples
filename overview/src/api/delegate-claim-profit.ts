import express, { Express, Request, Response } from "express";

import * as ludex from "ludex";
import { ethers } from "ethers";

import { APIAttachment } from "./api-attachment";

import dotenv from "dotenv";

dotenv.config();

async function web2Transfer(amount: bigint, sellerID: bigint)
{
    // We should implement this function
    // Transfer proper amount of USD that could be translated to `amount`
    // to user of sellerID
}

async function functionBody (attachment: APIAttachment, req: Request, res: Response) {
    const data = req.body;

    console.log(`data: ${JSON.stringify(data)}`);

    const sellerID: bigint = 
        BigInt(data.sellerID);
    const itemID: bigint = 
        BigInt(data.itemID);
    const tokenAddress: ludex.Address = 
        ludex.Address.create(data.tokenAddress);

    const sellerProxy = 
        ludex
        .facade
        .createServiceFacade(
            attachment.privateChainConfig, 
            attachment.ludexConfig, 
            attachment.signer)
        .serviceAccessSellerProxy();
    
    // You MUST verify ID ownership

    // Owner's address doesn't need to be private info.
    // You can hardcode the value here
    // Using env here is only for convenience
    const ownerAddress = 
        ludex.Address.create(
            process.env.OWNER_ADDRESS as string);

    const amount = 
        await sellerProxy.claimProfit(
            sellerID, 
            itemID, 
            tokenAddress, 
            ownerAddress); 
    
    await web2Transfer(amount, sellerID);
    // In this code, owner gets the tokens in exchange of
    // Real USD transaction from the platfrom to user via Web2 infra
    // If you want, you can use other address for recipient of token
    // and skip the USD transaction

    res.json({ amount: amount.toString() });
}

export function postAPIDelegateClaimProfit()
{return (attachment: APIAttachment) => {
    attachment.app.post("/api/delegate-claim-profit", async (req: Request, res: Response) => {
        await functionBody(attachment, req, res);
    })
};}
