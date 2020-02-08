import express from "express";
import path from "path";
import cors from "cors";

const app = express();

app.set("port", process.env.PORT || 3001);
//app.use(cors);

// routes
import * as routes from "./routes";
app.get("/status", routes.status);

export default app;