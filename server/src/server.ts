import WebSocket from "ws";

import {SampleIterator, CannedSource} from "./source";
import {Workload, ClientMsg, Sample, ServerMsg} from "./interfaces";
import { IncomingMessage } from "http";

const source = new CannedSource("../data/sweep_0_25.json");

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
wss.on("connection", function connection(ws: WebSocket, req: IncomingMessage) {
    console.log("New connection from " + req.socket.remoteAddress);

    sendMsg(ws, "Greetings from HAIbrid!");

    ws.on("close", function(code: number, reason: string) {
        console.log("Dropped connection from " + req.socket.remoteAddress);
        wss.clients.forEach((ws) => sendMsg(ws, `Now serving ${wss.clients.size} connections`));
    });

    ws.on("message", function incoming(data: string) {
        const blob = JSON.parse(data);
        switch(blob["type"] as ClientMsg) {
            case "workload":
                source.updateWorkload(blob["workload"]);
                wss.clients.forEach((dst) => 
                    sendMsg(dst, "Workload changed by " + req.socket.remoteAddress));
        }
    });

    source.on("message", function(its: SampleIterator[], wk: Workload) {
        const samples = its.map((it) => it.get());
        if (samples === undefined) {
            return;
        }
        //console.log(samples[0].total_ts);
        sendSamples(ws, samples, wk);
    });
});
