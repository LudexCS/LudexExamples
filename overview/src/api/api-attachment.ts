import * as ludex from "ludex";
import { ethers } from "ethers";
import { Express, Request, Response } from "express";

export class APIAttachment
{
    constructor(
        public readonly app: Express, 
        public readonly publicChainConfig: ludex.configs.ChainConfig,
        public readonly privateChainConfig: ludex.configs.ChainConfig,
        public readonly ludexConfig: ludex.configs.LudexConfig,
        public readonly signer: ethers.Signer) 
    {}

    public attach(register: (attachment: APIAttachment) => void) : APIAttachment
    {
        register(this);
        return this;
    }
}