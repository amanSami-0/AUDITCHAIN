const express = require("express");
const session = require("express-session");
const path = require("path");

const sequelize = require("./config/db");
const routes = require("./routes/routes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔥 FIXED SESSION (IMPORTANT)
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));

app.use("/", routes);

sequelize.sync().then(() => {
    app.listen(4000, () => {
        console.log("Audit Access Service running on http://localhost:4000");
    });
});
