import WebSocket from "ws";

import {SampleIterator, CannedSource} from "./source";
import {Workload, ClientMsg, Sample, ServerMsg} from "./interfaces";

const source = new CannedSource("../data/sweep_0_1.json");

// Handlers for each kind of ServerMsg

function sendMsg(ws: WebSocket, msg: string) {
    ws.send(JSON.stringify({
        "type": "message" as ServerMsg,
        "msg": msg
    }));
}
function sendSamples(ws: WebSocket, samples: Sample[], wk: Workload) {
    if (samples === undefined || wk === undefined) {
        return;
    }

    ws.send(JSON.stringify({
        "type": "samples" as ServerMsg,
        "samples": samples,
        "workload": wk}
    ));
}

// Websocket server
const wss = new WebSocket.Server({ port: 3030 });
wss.on("connection", function connection(ws: WebSocket) {
    console.log("New connection");
    console.log("Now serving " + wss.clients.size + " connections");

    wss.clients.forEach((ws) => sendMsg(ws, "Now serving " + wss.clients.size + " connections"));

    sendMsg(ws, "Greetings!");

    ws.on("message", function incoming(data: string) {
        const blob = JSON.parse(data);
        switch(blob["type"] as ClientMsg) {
            case "workload":
                source.updateWorkload(blob["workload"]);
        }
    });

    source.on("message", function(its: SampleIterator[], wk: Workload) {
        console.log(wk);
        const samples = its.map((it) => it.get());
        if (samples === undefined) {
            return;
        }
        sendSamples(ws, samples, wk);
    });
});
