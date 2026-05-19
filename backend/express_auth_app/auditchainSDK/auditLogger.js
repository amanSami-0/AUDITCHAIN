const { generateHash } = require("./hash");
const geoip = require("geoip-lite");

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { auditHashToBytes32, toBoundedBytes } = require('./chainHelpers');
const { fetchChainAuditLogs, hashExistsOnChain } = require('./chainReader');
const fs = require('fs');

let api;
let companyAccount;
let auditLogModel;
let isChainReady = false;

function resolveLocation(data) {
    if (data.location && data.location !== 'Unknown') {
        return data.location;
    }
    const geo = geoip.lookup(data.ip_address || '');
    return geo ? `${geo.country}, ${geo.city || 'Unknown'}` : 'Unknown';
}

function submitToChain(logRow, payload) {
    const {
        current_hash,
        previous_hash,
        location,
        data,
    } = payload;

    const hashBytes = auditHashToBytes32(current_hash);
    const previousHashBytes = auditHashToBytes32(previous_hash);
    const quantity = data.visit_count || data.attempt_count || 1;
    const userId = Number(data.user_id) || 0;

    let finalActivityName = data.action || 'audit_log';
    if (data.attribute_name) {
        finalActivityName = `${finalActivityName} -> ${data.attribute_name} modified`;
    }

    return new Promise((resolve) => {
        api.tx.auditChain
            .submitAuditProof(
                Array.from(hashBytes),
                toBoundedBytes(finalActivityName),
                quantity,
                userId,
                toBoundedBytes(data.ip_address),
                toBoundedBytes(data.device),
                toBoundedBytes(location),
                toBoundedBytes(data.status),
                Array.from(previousHashBytes),
            )
            .signAndSend(companyAccount, { nonce: -1 }, async ({ status, dispatchError }) => {
                if (dispatchError) {
                    const msg = dispatchError.toString();
                    const alreadyOnChain =
                        msg.includes('ProofAlreadyExists') ||
                        msg.includes('0x00000000');
                    if (alreadyOnChain && logRow) {
                        console.log(`⛓️  Hash already on chain, clearing buffer: ${current_hash}`);
                        await logRow.destroy().catch(() => {});
                        resolve({ ok: true, duplicate: true });
                        return;
                    }
                    console.error('Chain Error:', msg);
                    if (logRow) {
                        await logRow.update({ chain_status: 'failed' }).catch(() => {});
                    }
                    resolve({ ok: false, error: msg });
                    return;
                }

                if (status.isInBlock) {
                    const blockHash = status.asInBlock.toString();
                    console.log(
                        `⛓️  On-Chain Audit Logged! Hash: ${current_hash} (polkadot.js: 0x${current_hash}), Block: ${blockHash}`
                    );
                    if (logRow) {
                        await logRow.destroy().catch(() => {});
                    }
                    resolve({ ok: true, blockHash });
                }
            })
            .catch(async (err) => {
                if (err.message.includes('Priority is too low')) {
                    console.log('⏳ Transaction already in pool, waiting for block...');
                    resolve({ ok: false, queued: true });
                    return;
                }
                console.error('Send error:', err.message);
                if (logRow) {
                    await logRow.update({ chain_status: 'failed' }).catch(() => {});
                }
                resolve({ ok: false, error: err.message });
            });
    });
}

exports.init = async (sequelize) => {
    console.log("✅ Initializing Parachain connection...");

    auditLogModel = require("./models/AuditLog")(sequelize);
    await auditLogModel.sync({ alter: true });

    try {
        await cryptoWaitReady();
        const wsUrl = process.env.WS_URL || 'ws://127.0.0.1:9988';
        const provider = new WsProvider(wsUrl);
        api = await ApiPromise.create({ provider });
        const keyring = new Keyring({ type: 'sr25519' });

        const jsonStr = fs.readFileSync('/Users/mammu/CodeWorks/AuditChain/blockchain/AuditChainExportJson.json', 'utf8');
        const json = JSON.parse(jsonStr)[0];
        companyAccount = keyring.addFromJson(json);
        companyAccount.decodePkcs8('123456');
        const alice = keyring.addFromUri('//Alice');

        await api.isReady;

        const { data: balance } = await api.query.system.account(companyAccount.address);
        if (balance.free.toBigInt() < 1000000000000n) {
            console.log("💰 Funding company account from Alice...");
            await new Promise((resolve) => {
                api.tx.balances
                    .transferAllowDeath(companyAccount.address, 1000000000000000n)
                    .signAndSend(alice, (result) => {
                        if (result.isFinalized) resolve();
                        else if (result.isError) resolve();
                    })
                    .catch(err => {
                        console.log("⚠️ Funding skip:", err.message);
                        resolve();
                    });
            });
        }

        if (api.tx.auditChain && api.tx.auditChain.authorizeSubmitter) {
            const isAuthorized = await api.query.auditChain.authorizedSubmitters(companyAccount.address);
            if (!isAuthorized.valueOf()) {
                console.log("🔐 Authorizing company account...");
                await new Promise((resolve) => {
                    api.tx.sudo
                        .sudo(api.tx.auditChain.authorizeSubmitter(companyAccount.address))
                        .signAndSend(alice, (result) => {
                            if (result.isFinalized) resolve();
                            else if (result.isError) resolve();
                        })
                        .catch(err => {
                            console.log("⚠️ Auth skip:", err.message);
                            resolve();
                        });
                });
            } else {
                console.log("🔐 Company account already authorized on chain.");
            }

            console.log("✅ Parachain API initialized & authorized!");
            isChainReady = true;
            try {
                await exports.flushPendingBuffer();
            } catch (flushErr) {
                console.warn("⚠️  Pending buffer flush skipped:", flushErr.message);
            }
        } else {
            console.log("⚠️  auditChain pallet not found in runtime. Buffer-only mode (SQLite).");
            isChainReady = false;
        }
    } catch (err) {
        console.error("⚠️  Failed to connect to Parachain:", err.message);
        isChainReady = false;
    }
};

/** Retry buffer rows when chain is available. */
exports.flushPendingBuffer = async () => {
    if (!isChainReady || !api || !companyAccount || !auditLogModel) {
        return;
    }

    const pending = await auditLogModel.findAll({
        where: { 
            chain_status: ['pending', 'offline', 'failed'] 
        },
        order: [['id', 'ASC']],
    });

    const { hashKeys } = await fetchChainAuditLogs(api, companyAccount?.address);

    for (const row of pending) {
        if (hashExistsOnChain(row.current_hash, hashKeys)) {
            await row.destroy().catch(() => {});
            continue;
        }
        await submitToChain(row, {
            current_hash: row.current_hash,
            previous_hash: row.previous_hash,
            location: row.location,
            data: row.toJSON(),
        });
    }
};

exports.log = async (data) => {
    try {
        const location = resolveLocation(data);

        const lastOnChain = isChainReady && api
            ? (await fetchChainAuditLogs(api, companyAccount?.address)).logs.slice(-1)[0]
            : null;

        const lastBuffer = await auditLogModel.findOne({
            order: [['id', 'DESC']],
        });

        const previous_hash =
            lastOnChain?.current_hash ||
            lastBuffer?.current_hash ||
            'GENESIS';

        const logData = {
            ...data,
            location,
            timestamp: data.timestamp || Date.now(),
            previous_hash,
            status: data.status || 'SUCCESS',
        };

        const current_hash = generateHash(logData);

        if (data.action === 'PAGE_VISIT') {
            const existing = await auditLogModel.findOne({
                where: {
                    page: data.page,
                    method: data.method,
                    ip_address: data.ip_address,
                    chain_status: 'pending',
                },
                order: [['id', 'DESC']],
            });

            if (existing && (Date.now() - new Date(existing.createdAt).getTime()) < 2000) {
                existing.visit_count += 1;
                await existing.save();
                return;
            }
        }

        let bufferRow = null;
        if (isChainReady && api && companyAccount) {
            bufferRow = await auditLogModel.create({
                ...logData,
                current_hash,
                chain_status: 'pending',
            });
            await api.isReady;
            await submitToChain(bufferRow, {
                current_hash,
                previous_hash,
                location,
                data: logData,
            });
        } else {
            await auditLogModel.create({
                ...logData,
                current_hash,
                chain_status: 'offline',
            });
            console.log(`🗄️  Buffered locally (chain offline): ${data.action}`);
        }

        if (data.status === 'SUSPICIOUS' || data.status === 'BLOCKED') {
            console.log('🚨 ALERT:', data);
        }
    } catch (err) {
        console.error('Audit Log Error:', err);
    }
};

exports.verifyChain = async () => {
    if (!isChainReady || !api) {
        return {
            valid: false,
            error: 'Blockchain node disconnected. Cannot verify.',
        };
    }

    const pendingCount = await auditLogModel.count({
        where: { chain_status: 'pending' },
    });
    if (pendingCount > 0) {
        return {
            valid: false,
            error: `${pendingCount} audit record(s) still in the SQLite buffer awaiting parachain confirmation. Wait a few seconds and try again.`,
        };
    }

    const { logs, hashKeys } = await fetchChainAuditLogs(api, companyAccount?.address);

    if (logs.length === 0) {
        return { valid: true, message: 'Parachain audit ledger is empty.' };
    }

    for (const log of logs) {
        if (!hashExistsOnChain(log.current_hash, hashKeys)) {
            return {
                valid: false,
                error: `On-chain record missing hash index for action "${log.action}" (hash 0x${log.current_hash}).`,
            };
        }
    }

    return {
        valid: true,
        message: `Parachain verified: ${logs.length} immutable record(s) on chain. SQLite buffer is empty.`,
        count: logs.length,
    };
};

exports.getApi = () => api;
exports.getCompanyAccount = () => companyAccount;
exports.isChainReady = () => isChainReady;
exports.fetchChainLogs = () =>
    isChainReady && api
        ? fetchChainAuditLogs(api, companyAccount?.address)
        : Promise.resolve({ logs: [], hashKeys: new Set() });
