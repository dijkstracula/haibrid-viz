import express from "express";
import path from "path";
import cors from "cors";

const app = express();

app.set("port", process.env.PORT || 3001);
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

app.use(cors);
app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

// routes
import * as routes from "./routes";
app.get("/", routes.index);

export default app;
