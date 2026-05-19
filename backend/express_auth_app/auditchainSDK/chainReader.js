const { u8aToHex } = require('@polkadot/util');
const { chainHashLookupCandidates } = require('./chainHelpers');

function normalizeHashHex(value) {
    if (!value) {
        return null;
    }
    const raw = typeof value === 'string' ? value : value.toHex?.() || u8aToHex(value);
    return raw.replace(/^0x/i, '').toLowerCase();
}

function formatChainTimestamp(ms) {
    const n = Number(String(ms).replace(/,/g, ''));
    if (!Number.isFinite(n) || n <= 0) {
        return null;
    }
    return new Date(n).toISOString();
}

/**
 * Load audit records from parachain storage (source of truth).
 */
async function fetchChainAuditLogs(api, companyAddress) {
    if (!api) {
        return { logs: [], hashKeys: new Set() };
    }

    const hashKeys = new Set();
    const hashIndexEntries = await api.query.auditChain.hashIndex.entries();
    for (const [key, value] of hashIndexEntries) {
        if (value) {
            const hex = normalizeHashHex(key.args[0]);
            if (hex) {
                hashKeys.add(hex);
                hashKeys.add(`0x${hex}`);
            }
        }
    }

    const logs = [];
    const historyEntries = await api.query.auditChain.userActivityHistory.entries();

    for (const [storageKey, records] of historyEntries) {
        const submitter = storageKey.args[0]?.toString?.() || '';
        if (companyAddress && submitter && submitter !== companyAddress) {
            continue;
        }

        const activityKey = storageKey.args[1];
        const activityName =
            activityKey?.toUtf8?.() ||
            activityKey?.toString?.() ||
            '';

        const list = records.toArray?.() || records || [];
        for (let index = 0; index < list.length; index++) {
            const record = list[index];
            const human = record.toHuman?.() || record;
            const current_hash = normalizeHashHex(
                human.hash_ || human.hash || (record.get && record.get('hash') ? record.get('hash').toHex() : null)
            );
            const previous_hash = normalizeHashHex(human.previousHash) || 'GENESIS';

            if (!current_hash) {
                continue;
            }

            const timestampMs = Number(String(human.timestamp || '0').replace(/,/g, ''));
            const createdAt = formatChainTimestamp(timestampMs) || new Date().toISOString();

            logs.push({
                id: `chain-${current_hash.slice(0, 12)}-${index}`,
                source: 'parachain',
                action: human.activityName || activityName || 'audit_log',
                user_id: Number(human.userId) || 0,
                ip_address: human.ipAddress || '',
                device: human.device || '',
                location: human.location || '',
                status: human.status || 'SUCCESS',
                page: human.activityName || activityName || '',
                quantity: Number(human.quantity) || 1,
                block_number: human.blockNumber?.toString?.() || human.blockNumber || '—',
                previous_hash,
                current_hash,
                chain_hash: `0x${current_hash}`,
                createdAt,
                timestamp: createdAt,
                on_chain: true,
            });
        }
    }

    logs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { logs, hashKeys };
}

function hashExistsOnChain(currentHash, hashKeys) {
    const candidates = chainHashLookupCandidates(currentHash);
    for (const form of candidates) {
        const normalized = normalizeHashHex(form);
        if (normalized && hashKeys.has(normalized)) {
            return true;
        }
        if (hashKeys.has(`0x${normalized}`)) {
            return true;
        }
    }
    return false;
}

module.exports = {
    fetchChainAuditLogs,
    hashExistsOnChain,
    normalizeHashHex,
};
