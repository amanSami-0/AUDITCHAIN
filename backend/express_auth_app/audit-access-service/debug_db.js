const Developer = require("./models/Developer");
const sequelize = require("./config/db");

async function test() {
    try {
        await sequelize.sync();
        const user = await Developer.findOne({ where: { username: 'test' } });
        console.log("Success:", user);
    } catch (err) {
        console.error("DEBUG ERROR:", err);
    } finally {
        await sequelize.close();
    }
}

test();
