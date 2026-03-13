const express = require("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const path = require("path")

const sequelize = require("./config/db")
const authRoutes = require("./routes/authRoutes")

/* AUDIT SDK */
const audit = require("./auditchainSDK")

const app = express()

/* =====================
   VIEW ENGINE
===================== */

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

/* =====================
   STATIC FILES
===================== */

app.use(express.static(path.join(__dirname, "public")))

/* =====================
   BODY PARSER
===================== */

app.use(bodyParser.urlencoded({ extended: true }))

/* =====================
   COOKIE PARSER
===================== */

app.use(cookieParser())

/* =====================
   SESSION
===================== */

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}))

/* =====================
   FLASH MESSAGES
===================== */

app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

/* =====================
   AUDIT SDK
===================== */

audit.init()

app.use(audit.middleware())

app.use("/audit", audit.dashboard)

/* =====================
   ROUTES
===================== */

app.use("/", authRoutes)

/* =====================
   DATABASE + SERVER
===================== */

sequelize.sync().then(() => {

    console.log("Database Connected")

    app.listen(3000, () => {
        console.log("Server running at http://localhost:3000")
        console.log("Audit dashboard at http://localhost:3000/audit")
    })

}).catch(err => {
    console.log("Database error:", err)
})
