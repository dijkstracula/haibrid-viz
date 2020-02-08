import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 3030 });

wss.on("connection", function connection(ws: WebSocket) {
    console.log("New connection");

    ws.send(JSON.stringify({"msg": "Greetings"}));
    
    ws.on("message", function incoming(data: string) {
        console.log("TODO: received " + data);
    });
});

export default wss;