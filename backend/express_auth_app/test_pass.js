const fs = require('fs');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

async function main() {
    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519' });
    
    const jsonStr = fs.readFileSync('/Users/mammu/CodeWorks/AuditChain/blockchain/AuditChainExportJson.json', 'utf8');
    const json = JSON.parse(jsonStr)[0];
    
    const account = keyring.addFromJson(json);
    
    const passwordsToTry = ['', 'password', '123456', '12345678', 'AuditChain'];
    
    let unlocked = false;
    for (const pwd of passwordsToTry) {
        try {
            account.decodePkcs8(pwd);
            console.log(`Success! Unlocked with password: '${pwd}'`);
            unlocked = true;
            break;
        } catch (e) {
            // failed
        }
    }
    
    if (!unlocked) {
        console.log("Could not unlock with common passwords.");
    }
}
main();
