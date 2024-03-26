const express = require("express");
const app = express();
const port = 3000;
const public = __dirname + "\\public"

app.use(express.static(public))

app.listen(port, () => {
    console.log(`iets bij port ${port}`)
})
