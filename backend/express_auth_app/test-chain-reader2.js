const { ApiPromise, WsProvider } = require('@polkadot/api');
const { fetchChainAuditLogs } = require('./auditchainSDK/chainReader');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

async function main() {
    await cryptoWaitReady();
    const provider = new WsProvider('ws://127.0.0.1:9988');
    const api = await ApiPromise.create({ provider });

    const { logs, hashKeys } = await fetchChainAuditLogs(api, null);
    
    console.log("ALL HASH KEYS:");
    for (const h of hashKeys) {
        if (!h.startsWith('0x')) console.log(h);
    }

    console.log("\nALL LOG HASHES:");
    for (const l of logs) {
        console.log(l.current_hash);
    }
    
    process.exit(0);
}

main().catch(console.error);
