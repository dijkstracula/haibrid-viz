import app from "./app";
import wss from "./ws";

wss;

const server = app.listen(app.get("port"), () => {
    console.log("Backend listening on port %d", app.get("port"));
});

