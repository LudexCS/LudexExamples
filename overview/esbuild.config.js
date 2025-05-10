import { build } from "esbuild";
import fs from "fs";
import path from "path";

const entryDirectory = "src/public/ts";
const entryPoints = 
    fs.readdirSync(entryDirectory)
    .filter(file => file.endsWith(".ts"))
    .map(file => path.join(entryDirectory, file));

build({
    entryPoints,
    outdir: "dist/public/js",
    bundle: true,
    minify: false,
    format: "iife",
    target: "es2020"
}).catch(() => process.exit(1));