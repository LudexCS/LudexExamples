import express, { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";

import * as ludex from "ludex";
import { ethers } from "ethers";

import { APIAttachment } from "./api-attachment";

export function postAPIContracts (contracts: any)
{return function (attachment: APIAttachment) {
    attachment.app.post(
        "/api/contracts", 
        async (_: Request, res: Response) => {
            res.json(contracts);
        }
    );
};}

export function getAPIGiveaway (contracts: any) 
{return function (attachment: APIAttachment) {
    if (!contracts.MockUSDC)
    {
        console.log(
            "The deployment doesn't include MockUSDC, not adding giveaway api");
    }

    const usdcAddress = contracts.MockUSDC.address;

    attachment.app.get("/api/giveaway", async (req: Request, res: Response) => {
        // You might wanna add some validation steps here, to avoid abusing
        const { to } = JSON.parse(req.body);

        await ludex.giveawayUSDC(
            ludex.Address.create(usdcAddress),
            ludex.Address.create(to),
            attachment.signer);

        res.status(204).send();
    });
};}