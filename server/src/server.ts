import WebSocket from "ws";

import {SampleIterator, CannedSource} from "./source";
import {Workload,ClientMsg, ServerMsg} from "./interfaces";

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

    source.on("message", function(its: SampleIterator[], wk: Workload) {
        const samples = its.map((it) => it.get());
        ws.send(JSON.stringify({
            "type": "samples" as ServerMsg,
            "samples": samples,
            "workload": wk}
        ));
    });
});