import express, { Express, Request, Response } from "express";

import * as ludex from "ludex";
import { ethers } from "ethers";

import { APIAttachment } from "./api-attachment";

async function functionBody (attachment: APIAttachment, req: Request, res: Response) {
    const data = req.body;

    console.log(`data: ${JSON.stringify(data)}`);

    const sellerID: bigint = 
        BigInt(data.sellerID);
    const itemID: bigint = 
        BigInt(data.itemID);
    const newPrice: bigint =
        BigInt(data.newPrice);

    const sellerProxy = 
        ludex
        .facade
        .createServiceFacade(
            attachment.privateChainConfig, 
            attachment.ludexConfig, 
            attachment.signer)
        .serviceAccessSellerProxy();
    
    const prevPrice = 
        await sellerProxy.changeItemPrice(sellerID, itemID, newPrice);

    res.json({ prevPrice: prevPrice.toString() });
}

export function postAPIDelegateChangePrice()
{return (attachment: APIAttachment) => {
    attachment.app.post("/api/delegate-change-price", async (req: Request, res: Response) => {
        await functionBody(attachment, req, res);
    })
};}
