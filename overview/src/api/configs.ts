import * as ludex from "ludex";
import { ethers } from "ethers";
import { Express, Request, Response } from "express";
import { APIAttachment } from "./api-attachment";

export function postConfigs()
{return function(attachment: APIAttachment) {
    attachment.app.post("/api/configs", async (_: Request, res: Response) => {
        res.json({
            chainConfig: {...attachment.publicChainConfig},
            ludexConfig: {...attachment.ludexConfig}
        });
    });
};}