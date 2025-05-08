import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";

const app = express();
const port = 4000;

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/trigger", (_req: Request, res: Response) => {
  res.json({ message: "Triggered from backend!" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});