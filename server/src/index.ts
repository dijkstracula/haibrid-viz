import app from "./app";

const server = app.listen(app.get("port"), () => {
    console.log("Backend listening on port %d", app.get("port"));
});