const { ApiPromise, WsProvider } = require('@polkadot/api');
const { fetchChainAuditLogs } = require('./auditchainSDK/chainReader');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

async function main() {
    await cryptoWaitReady();
    const provider = new WsProvider('ws://127.0.0.1:9988');
    const api = await ApiPromise.create({ provider });

    const hashIndexEntries = await api.query.auditChain.hashIndex.entries();
    console.log("Found", hashIndexEntries.length, "hash index entries");
    
    for (let i = 0; i < Math.min(2, hashIndexEntries.length); i++) {
        const [key, value] = hashIndexEntries[i];
        console.log("Entry", i);
        console.log("  Key args[0]:", key.args[0].toHex ? key.args[0].toHex() : key.args[0]);
        console.log("  Value isSome:", value.isSome);
        console.log("  Value human:", value.toHuman ? value.toHuman() : value);
    }

    const { logs, hashKeys } = await fetchChainAuditLogs(api, null);
    console.log("\nHashKeys size:", hashKeys.size);
    if (hashKeys.size > 0) {
        console.log("Sample hashKey:", Array.from(hashKeys)[0]);
    }
    
    console.log("\nLogs:", logs.length);
    if (logs.length > 0) {
        console.log("First log hash:", logs[0].current_hash);
        console.log("Found in hashKeys?", hashKeys.has(logs[0].current_hash) || hashKeys.has('0x'+logs[0].current_hash));
    }
    
    process.exit(0);
}

main().catch(console.error);
