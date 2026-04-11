const express = require("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const path = require("path")
const axios = require("axios")   // 🔥 IMPORTANT

const sequelize = require("./config/db")
const audit = require("./auditchainSDK")

// ✅ LOAD USER MODEL
require("./models/User")

const authRoutes = require("./routes/authRoutes")

const app = express()

app.set("trust proxy", true)

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}))

app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})


// =====================
// 🔐 REAL AUDIT ACCESS GUARD (FINAL FIX)
// =====================

async function auditAccessGuard(req, res, next) {

    try {

        const response = await axios.get(
            "http://localhost:4000/verify-session",
            {
                headers: {
                    Cookie: req.headers.cookie || ""   // 🔥 forward session
                }
            }
        );

        if (!response.data.valid) {
            return res.redirect("http://localhost:4000/login");
        }

        next();

    } catch (err) {
        return res.redirect("http://localhost:4000/login");
    }
}


// =====================
// 🚀 START SERVER
// =====================

async function startServer() {

    try {

        // ✅ INIT AUDIT SDK
        await audit.init()

        // ✅ SDK MIDDLEWARE
        app.use(audit.middleware())

        // ✅ MAIN APP ROUTES
        app.use("/", authRoutes)

        // 🔐 PROTECTED AUDIT ROUTE
        app.use("/audit", auditAccessGuard, audit.dashboard)

        // ✅ DB
        await sequelize.sync()

        console.log("Database Connected")

        app.listen(3000, () => {
            console.log("Server running at http://localhost:3000")
            console.log("Audit dashboard protected via external service")
        })

    } catch (err) {
        console.error("Startup Error:", err)
    }
}

startServer()
