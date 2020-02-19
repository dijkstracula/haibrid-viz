import WebSocket from "ws";

import CannedSource from "./CannedSource";
import {Workload, Sample, ClientMsg} from "./interfaces";

// 
const source = new CannedSource("../data/sandwich.json");

// Websocket server
const wss = new WebSocket.Server({ port: 3030 });
wss.on("connection", function connection(ws: WebSocket) {
    console.log("New connection");
    console.log("Now serving " + wss.clients.size + " connections");

    ws.send(JSON.stringify({"msg": "Greetings"}));
    
    ws.on("message", function incoming(data: string) {
        const blob = JSON.parse(data);
        console.log("TODO: received " + data);
        switch(blob["type"] as ClientMsg) {
            case "workload":
                source.updateWorkload(blob["workload"]);
        }
    }); 

    source.on("message", function(s: Sample, wk: Workload) {
        ws.send(JSON.stringify({
            "type": "sample", 
            "sample": s,
            "workload": wk}
        ));
    });
});