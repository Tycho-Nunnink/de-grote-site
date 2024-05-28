const express = require("express");
const app = express();
const port = 3000;
const public = __dirname + "\\public"
let acounts = { naam: "wachtwoord", wachtwoord: "doei" }

app.use((req, res, next) => {
    console.log(`dit is ${req.url}`)
    next()
})

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get("/", (req, res) => {
    res.redirect("/login.html")
    console.log("redirect!")
})

app.use(express.static(public))
app.post("/boem", (req, res) => {
    console.log(`boem ${JSON.stringify(req.body)}`);
    res.send(req.body)
})

app.post("/check", (req, res) => {
    console.log(`check ${JSON.stringify(req.body)}`)
    res.json(req.body.naam == acounts.naam && req.body.wachtwoord == acounts.wachtwoord)
})


app.listen(port, () => {
    console.log(`iets bij port ${port}`)
})
