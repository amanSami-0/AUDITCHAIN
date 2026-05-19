const { ApiPromise, WsProvider } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { u8aToHex } = require('@polkadot/util');

async function main() {
    await cryptoWaitReady();
    const provider = new WsProvider('ws://127.0.0.1:9988');
    const api = await ApiPromise.create({ provider });

    const historyEntries = await api.query.auditChain.userActivityHistory.entries();
    for (const [key, records] of historyEntries) {
        const list = records.toArray?.() || records || [];
        for (let index = 0; index < list.length; index++) {
            const record = list[index];
            const human = record.toHuman();
            console.log("Human:", human.hash);
            console.log("Record hash:", record.hash ? u8aToHex(record.hash) : 'undefined');
        }
    }
    
    process.exit(0);
}

main().catch(console.error);
