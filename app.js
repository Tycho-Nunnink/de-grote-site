const fs = require("node:fs")
const crypto = require("node:crypto")
const bcrypt = require("bcrypt")

// mysql setup --------------------
const db = require("mysql")
const con = db.createConnection({
    host: "localhost",
    user: "root",
    password: "wachtwoord",
    database: "app"
})
con.connect((err) => {
    if (err) throw err
    console.log("db goed")
})

// express setup --------------------
const cookieParser = require("cookie-parser")
const express = require("express")
const app = express()
const port = 3000
const public = __dirname + "\\public"
const cookie = "session"

function cookieMaker(id) {
    let nieuw = crypto.randomBytes(4).toString("hex")

    const query = "SELECT id FROM Users WHERE cookie = ?;"
    con.query(query, [nieuw], (err, result, fields) => {
        if (err) throw err

        if (result.length > 0) {
            const query = "UPDATE Users SET cookie = NULL WHERE id = ?;"
            con.query(query, [result[0].id], (err, result, fields) => { if (err) throw err })
        }
        const query = "UPDATE Users SET cookie = ? WHERE id = ?;"
        con.query(query, [nieuw, id], (err, result, fields) => { if (err) throw err })
    })
    return nieuw
}

// use --------------------
app.use((req, res, next) => {
    console.log(`dit is ${req.url} met een ${req.method}`)
    next()
})

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())

// request handelers --------------------
app.get("/", (req, res) => {
    let file = fs.readFileSync(public + "\\index.html", "utf-8")
    const sendHomeDefault = () => {
        file = file.replace("\$l", "<a href='/create'>maak een acount</a><a href='/login'>login</a>")
        file = file.replace("\$m", "")
        res.send(file)
    }

    if (!(cookie in req.cookies) || req.cookies[cookie] == "") {
        sendHomeDefault(res)
        return
    }
    const query = "SELECT username FROM Users WHERE cookie = ?;"
    con.query(query, [req.cookies[cookie]], (err, result, fields) => {
        if (err) throw err

        if (result.length == 0) {
            res.cookie(cookie, "")
            sendHomeDefault(res)
            return
        }
        file = file.replace("\$m", `hallo ${result[0].username}!<br>`)
        file = file.replace("\$l", "<a href='/profile'>jouw profiel</a>")
        res.send(file)
    })
})

app.get("/profile", (req, res) => {
    let file = fs.readFileSync(public + "\\profile.html", "utf-8")

    if (!(cookie in req.cookies) || req.cookies[cookie] == "") {
        res.redirect("/")
        return
    }
    const query = "SELECT username FROM Users WHERE cookie = ?;"
    con.query(query, [req.cookies[cookie]], (err, result, fields) => {
        if (err) throw err

        if (result.length == 0) {
            res.cookie(cookie, "")
            res.redirect("/")
            return
        }
        file = file.replace("\$t", result[0].username)
        file = file.replace("\$n", `hallo ${result[0].username}, dit is jouw profiel. mooi hè?`)
        res.send(file)
    })
})

app.get("/create", (req, res) => {
    let file = fs.readFileSync(public + "\\create.html", "utf-8")
    file = file.replace("\$n", "")
    file = file.replace("\$w", "")
    res.send(file)
})

app.post("/create", (req, res) => {
    const query = "SELECT username FROM Users WHERE username = ?;"
    con.query(query, [req.body.naam], (err, result, fields) => {
        if (err) throw err

        if (result.length > 0) {
            let file = fs.readFileSync(public + "\\create.html", "utf-8")
            file = file.replace("\$n", req.body.naam || "")
            file = file.replace("\$w", "gebruiker met die naam bestaat al")
            res.send(file)
            return
        }
        bcrypt.hash(req.body.wachtwoord, 10, (err, hash) => {
            if (err) throw err

            const query = "INSERT INTO users (username, pswdhash) VALUES (?, ?);"
            con.query(query, [req.body.naam, hash], (err, result, fields) => {
                if (err) throw err
            })

            con.query("SELECT id FROM Users WHERE username = ?;", [req.body.naam], (err, result, fields) => {
                res.cookie(cookie, cookieMaker(result[0].id))
                res.redirect("/")
            })

        })
    })

})

app.get("/delete", (req, res) => {
    if (!(cookie in req.cookies) || req.cookies[cookie] == "") {
        res.redirect("/")
        return
    }
    let file = fs.readFileSync(public + "\\delete.html", "utf-8")
    file = file.replace("\$n", "")
    file = file.replace("\$w", "")
    res.send(file)
})

app.post("/delete", (req, res) => {
    if (!(cookie in req.cookies) || req.cookies[cookie] == "") {
        res.redirect("/")
        return
    }

    const query = `SELECT id, pswdhash FROM Users WHERE username = ? AND cookie = ?;`
    con.query(query, [req.body.naam, req.cookies[cookie]], (err, qResult, fields) => {
        if (err) throw err

        const sendWarning = () => {
            let file = fs.readFileSync(public + "\\delete.html", "utf-8")
            file = file.replace("\$n", req.body.naam || "") // poor mans react
            file = file.replace("\$w", "onjuiste gebruikersnaam of wachtwoord")
            res.send(file)
        }

        if (qResult.length == 0) {
            sendWarning()
            return
        }
        bcrypt.compare(req.body.wachtwoord, qResult[0].pswdhash, (err, hResult) => {
            if (err) throw err

            if (!hResult) {
                sendWarning()
                return
            }
            const query = `DELETE FROM Users WHERE id = ?;`
            con.query(query, [qResult[0].id], (err, result, fields) => {
                res.cookie(cookie, "")
                res.redirect("/")
            })
        })
    })
})

app.get("/login", (req, res) => {
    let file = fs.readFileSync(public + "\\login.html", "utf-8")
    file = file.replace("\$n", "")
    file = file.replace("\$w", "")
    res.send(file)
})

app.post("/login", (req, res) => {
    const query = `SELECT id, pswdhash FROM Users WHERE username = ?`
    con.query(query, [req.body.naam], (err, qResult, fields) => {
        if (err) throw err

        const sendWarning = () => {
            let file = fs.readFileSync(public + "\\login.html", "utf-8")
            file = file.replace("\$n", req.body.naam || "")
            file = file.replace("\$w", "onjuiste gebruikersnaam of wachtwoord")
            res.send(file)
        }

        if (qResult.length == 0) {
            sendWarning()
            return
        }
        bcrypt.compare(req.body.wachtwoord, qResult[0].pswdhash, (err, hResult) => {
            if (err) throw err

            if (!hResult) {
                sendWarning()
                return
            }
            res.cookie(cookie, cookieMaker(qResult[0].id))
            res.redirect("/")
        })
    })
})

app.get("/logout", (req, res) => {
    res.cookie("session", "")
    res.redirect("/")
})

// laatste express setup --------------------
app.use(express.static(public))

app.listen(port, () => {
    console.log(`iets bij port ${port}`)
})
