import WebSocket from "ws";

import {SampleIterator, CannedSource} from "./source";
import {Workload,ClientMsg} from "./interfaces";

// 
const source = new CannedSource("../data/sandwich_multiple.json");

// Websocket server
const wss = new WebSocket.Server({ port: 3030 });
wss.on("connection", function connection(ws: WebSocket) {
    console.log("New connection");
    console.log("Now serving " + wss.clients.size + " connections");

    ws.send(JSON.stringify({"msg": "Greetings"}));
    
    ws.on("message", function incoming(data: string) {
        const blob = JSON.parse(data);
        switch(blob["type"] as ClientMsg) {
            case "workload":
                source.updateWorkload(blob["workload"]);
        }
    }); 

    source.on("message", function(it: SampleIterator, wk: Workload) {
        ws.send(JSON.stringify({
            "type": "sample", 
            "ds": it.ds,
            "sample": it.get(),
            "workload": wk}
        ));
    });
});