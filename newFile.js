const { app, con, cookie } = require("./app");

app.post("/create", (req, res) => {
    const query = "SELECT * FROM Users WHERE id=2;";
    con.query(query, [], (err, result, fields) => {
        if (err) throw err;
    });

    const innerQuery = "INSERT INTO users (username, pswdhash) VALUES ( ?, ?); SELECT MAX(id) AS id FROM Users;";
    con.query(innerQuery, [req.body.naam, req.body.wachtwoord], (err, result, fields) => {
        if (err) throw err;
        res.cookie(cookie, result[0].id);
        res.redirect("/");
    });
});
