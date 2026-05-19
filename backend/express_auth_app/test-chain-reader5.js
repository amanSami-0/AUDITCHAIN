const { ApiPromise, WsProvider } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

async function main() {
    await cryptoWaitReady();
    const provider = new WsProvider('ws://127.0.0.1:9988');
    const api = await ApiPromise.create({ provider });

    const historyEntries = await api.query.auditChain.userActivityHistory.entries();
    for (const [key, records] of historyEntries) {
        const list = records.toArray?.() || records || [];
        if (list.length > 0) {
            const human = list[0].toHuman();
            console.log("Human record:", human);
            console.log("Raw record JSON:", list[0].toJSON());
            break;
        }
    }
    
    process.exit(0);
}

main().catch(console.error);
