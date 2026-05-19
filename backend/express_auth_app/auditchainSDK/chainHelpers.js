const { blake2AsU8a } = require('@polkadot/util-crypto');
const { stringToU8a, hexToU8a } = require('@polkadot/util');

/** Matches extrinsic arg `hash` / `previousHash` ([u8; 32]) used at submit time. */
function auditHashToBytes32(hashStr) {
    if (!hashStr || hashStr === 'GENESIS') {
        return new Uint8Array(32);
    }
    if (/^[0-9a-fA-F]{64}$/.test(hashStr)) {
        return hexToU8a(hashStr);
    }
    return blake2AsU8a(stringToU8a(hashStr), 256);
}

function toBoundedBytes(value, maxLen = 64) {
    return Array.from(stringToU8a(String(value ?? '').substring(0, maxLen)));
}

function bytes32ToLookupSet(hashBytes) {
    const hex = Buffer.from(hashBytes).toString('hex');
    return new Set([hex, `0x${hex}`]);
}

/** All [u8;32] forms that may appear in hashIndex for a SQLite current_hash. */
function chainHashLookupCandidates(currentHash) {
    const out = new Set();
    for (const form of bytes32ToLookupSet(auditHashToBytes32(currentHash))) {
        out.add(form);
    }
    // Older backend used blake2 of the hex string instead of raw sha256 bytes.
    if (/^[0-9a-fA-F]{64}$/.test(currentHash)) {
        for (const form of bytes32ToLookupSet(blake2AsU8a(stringToU8a(currentHash), 256))) {
            out.add(form);
        }
    }
    return out;
}

module.exports = {
    auditHashToBytes32,
    toBoundedBytes,
    bytes32ToLookupSet,
    chainHashLookupCandidates,
};
