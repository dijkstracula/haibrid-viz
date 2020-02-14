import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 3030 });

wss.on("connection", function connection(ws: WebSocket) {
    console.log("New connection");

    ws.send(JSON.stringify({"msg": "Greetings", samples: []}));
    
    ws.on("message", function incoming(data: string) {
        console.log("TODO: received " + data);
    });
});
