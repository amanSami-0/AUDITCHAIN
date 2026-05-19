const { ApiPromise, WsProvider } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { u8aToHex } = require('@polkadot/util');

async function main() {
    await cryptoWaitReady();
    const provider = new WsProvider('ws://127.0.0.1:9988');
    const api = await ApiPromise.create({ provider });

    const hashIndexEntries = await api.query.auditChain.hashIndex.entries();
    for (const [key, value] of hashIndexEntries) {
        console.log("Key args[0]:", u8aToHex(key.args[0]));
    }
    
    process.exit(0);
}

main().catch(console.error);
