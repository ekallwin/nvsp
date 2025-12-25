console.log("Starting server.js...");
const app = require("./index");
const port = process.env.PORT || 5000;

console.log("Attempting to listen on port " + port);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
