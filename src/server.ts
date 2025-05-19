import express, { Request, Response } from "express";
import { RegisterRoutes } from "./routes/routes"; // that is tsoa generated file
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../dist/swagger.json"; // that is tsoa generated file
import cors from "cors";

const app = express();
const PORT = 3000; // TODO: refactor using dotenv

app.use(express.json());
app.use(cors());

RegisterRoutes(app);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/swagger.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript with Express!");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/docs`);
});
