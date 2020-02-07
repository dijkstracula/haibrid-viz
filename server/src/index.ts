import app from "./app";

const server = app.listen(app.get("port"), () => {
    console.log("Listening on port %d", app.get("port"));
});