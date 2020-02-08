import express from "express";
import path from "path";
import cors from "cors";
import CannedSource from "./source";
import WebSocket from "ws";

// 

const source = new CannedSource("../data/test.json");

// Websocket server
const wss = new WebSocket.Server({ port: 3030 });
wss.on("connection", function connection(ws: WebSocket) {
    console.log("New connection");
    console.log("Now serving " + wss.clients.size + " connections");

    ws.send(JSON.stringify({"msg": "Greetings"}));
    
    ws.on("message", function incoming(data: string) {
        console.log("TODO: received " + data);
    });

    source.on("message", function(s: Sample) {
        ws.send(JSON.stringify({"msg": "Incoming sample", "sample": s}));
    });
});


// HTTP server (don't know if we actually need this, in the end?)

const app = express();

app.set("port", process.env.PORT || 3001);
//app.use(cors);

// routes
import * as routes from "./routes";
import { Sample } from "./sample";
app.get("/status", routes.status);

const server = app.listen(app.get("port"), () => {
    console.log("Backend listening on port %d", app.get("port"));
});

