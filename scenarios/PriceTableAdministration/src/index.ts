import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";

const app = express();
const port = 4000;

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
