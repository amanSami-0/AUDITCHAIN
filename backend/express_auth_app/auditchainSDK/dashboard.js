const express = require("express");
const path = require("path");
const axios = require("axios");
const auditLogger = require("./auditLogger");
let AuditLog;

const router = express.Router();

async function initModel() {
    if (!AuditLog) {
        const sequelize = require("./database").initDatabase();
        AuditLog = require("./models/AuditLog")(sequelize);
        await AuditLog.sync({ alter: true });
    }
}

function formatBufferRow(log) {
    return {
        id: log.id,
        source: 'buffer',
        user_id: log.user_id,
        action: log.action,
        page: log.page,
        method: log.method,
        attribute_name: log.page || log.action || '—',
        ip_address: log.ip_address || '—',
        user_agent: log.device || '—',
        location: log.location || '—',
        status: log.status || '—',
        previous_hash: log.previous_hash,
        current_hash: log.current_hash,
        chain_hash: `0x${log.current_hash}`,
        createdAt: log.createdAt,
        timestamp: log.createdAt,
        block_number: 'Pending',
        on_chain: false,
        chain_status: log.chain_status,
    };
}

function formatChainRow(log) {
    return {
        id: log.id,
        source: log.source,
        user_id: log.user_id,
        action: log.action,
        page: log.page,
        attribute_name: log.page || log.location || log.action,
        ip_address: log.ip_address || '—',
        user_agent: log.device || '—',
        location: log.location || '—',
        status: log.status || 'SUCCESS',
        previous_hash: log.previous_hash,
        current_hash: log.current_hash,
        chain_hash: log.chain_hash,
        createdAt: log.createdAt,
        timestamp: log.timestamp || log.createdAt,
        block_number: log.block_number,
        on_chain: true,
        chain_status: 'confirmed',
    };
}

async function loadMergedLogs(userIdFilter) {
    const api = auditLogger.getApi();
    const isChainReady = auditLogger.isChainReady && auditLogger.isChainReady();

    let chainLogs = [];
    if (isChainReady && api) {
        const { logs } = await auditLogger.fetchChainLogs();
        chainLogs = logs;
    }

    if (userIdFilter && userIdFilter.trim() !== '') {
        const uid = Number(userIdFilter);
        chainLogs = chainLogs.filter((l) => Number(l.user_id) === uid);
    }

    await initModel();
    const bufferRows = await AuditLog.findAll({
        order: [['id', 'DESC']],
        limit: 50,
    });

    const bufferFormatted = bufferRows.map(formatBufferRow);
    const chainFormatted = chainLogs.map(formatChainRow).reverse();

    const merged = [...bufferFormatted, ...chainFormatted];
    merged.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return merged.slice(0, 100);
}

router.get("/", async (req, res) => {
    const { user_id } = req.query;

    try {
        const logs = await loadMergedLogs(user_id);

        if (req.accepts("json")) {
            return res.json({ logs, source: "parachain+buffer" });
        }

        res.render(path.join(__dirname, "views", "auditDashboard"), {
            logs,
            user_id: user_id || "",
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ error: "Failed to load logs" });
    }
});

router.get("/export", async (req, res) => {
    try {
        const { user_id } = req.query;
        const logs = await loadMergedLogs(user_id);

        if (!logs || logs.length === 0) {
            return res.status(404).send("No logs to export");
        }

        const headers = ["ID", "Source", "User ID", "Action", "Attribute Name", "IP Address", "User Agent", "Location", "Status", "Previous Hash", "Current Hash", "Chain Hash", "Created At", "Block Number", "On Chain"];

        const csvRows = logs.map(log => {
            return [
                log.id,
                log.source,
                log.user_id,
                log.action,
                log.attribute_name,
                log.ip_address,
                `"${log.user_agent ? log.user_agent.replace(/"/g, '""') : '—'}"`,
                `"${log.location ? log.location.replace(/"/g, '""') : '—'}"`,
                log.status,
                log.previous_hash,
                log.current_hash,
                log.chain_hash,
                log.createdAt,
                log.block_number,
                log.on_chain
            ].join(",");
        });

        const csvData = [headers.join(","), ...csvRows].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=audit_logs.csv");
        return res.status(200).send(csvData);
    } catch (error) {
        console.error("Export error:", error);
        res.status(500).send("Failed to export logs");
    }
});

router.get("/verify", async (req, res) => {
    try {
        const result = await auditLogger.verifyChain();
        return res.json(result);
    } catch (err) {
        console.error("Verification error:", err);
        return res.json({ valid: false, error: "Verification failed due to server error." });
    }
});

router.post("/flush-buffer", async (req, res) => {
    try {
        await auditLogger.flushPendingBuffer();
        return res.json({ success: true, message: "Buffer flush triggered on backend." });
    } catch (err) {
        console.error("Flush error:", err);
        return res.status(500).json({ success: false, error: "Failed to flush buffer." });
    }
});

router.get("/logout", async (req, res) => {
    try {
        await axios.get("http://localhost:4000/logout", {
            headers: { Cookie: req.headers.cookie || "" },
            withCredentials: true,
        });
    } catch (err) {
        console.log("Logout sync failed");
    }
    req.session.destroy(() => {
        res.redirect("http://localhost:4000/login");
    });
});

module.exports = router;
