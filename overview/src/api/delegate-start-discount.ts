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
    const discountPrice: bigint =
        BigInt(data.discountPrice);
    const endTime: Date = 
        new Date(data.endTime);

    const sellerProxy = 
        ludex
        .facade
        .createServiceFacade(
            attachment.privateChainConfig, 
            attachment.ludexConfig, 
            attachment.signer)
        .serviceAccessSellerProxy();
    
    await sellerProxy.startDiscount(sellerID, itemID, discountPrice, endTime);
}

export function postAPIDelegateStartDiscount()
{return (attachment: APIAttachment) => {
    attachment.app.post("/api/delegate-start-discount", async (req: Request, res: Response) => {
        await functionBody(attachment, req, res);
    })
};}
