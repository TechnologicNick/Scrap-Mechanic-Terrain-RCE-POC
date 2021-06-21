const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const SQL = require("sql-template-strings");
const fs = require("fs");

(async () => {
    const db = await open({
        filename: "./TerrainRCE_FLAT.db",
        mode: sqlite3.OPEN_READWRITE,
        driver: sqlite3.Database
    });

    const { data: dataCompressed } = await db.get(SQL`SELECT data FROM GenericData WHERE channel = 11`);

    console.log("dataCompressed", dataCompressed);
    fs.writeFileSync("./data.bin", dataCompressed);


})()