const express = require("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const cors = require("cors")
const path = require("path")

const sequelize = require("./config/db")
const authRoutes = require("./routes/authRoutes")

/* AUDIT SDK */
const audit = require("./auditchainSDK")

const app = express()

/* =====================
   CORS
===================== */

app.use(cors({ origin: 'http://localhost:3001', credentials: true }))

/* =====================
   STATIC FILES
===================== */

app.use(express.static(path.join(__dirname, "public")))

/* =====================
   BODY PARSER
===================== */

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

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
   AUDIT SDK
===================== */

audit.init()

app.use(audit.middleware())

app.use("/audit", audit.dashboard)

/* =====================
   ROUTES
===================== */

app.get("/", (req, res) => {
    res.json({ status: "AuditChain API is running. Please access the App via the Next.js Frontend." });
});

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
