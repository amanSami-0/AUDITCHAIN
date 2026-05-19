const { ApiPromise, WsProvider } = require('@polkadot/api');
async function main() {
  const provider = new WsProvider('ws://127.0.0.1:9988');
  const api = await ApiPromise.create({ provider });
  console.log("Pallets:", Object.keys(api.tx).filter(k => k.toLowerCase().includes('audit')));
  process.exit(0);
}
main();
