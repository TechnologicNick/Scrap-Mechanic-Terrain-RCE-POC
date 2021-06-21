const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const SQL = require("sql-template-strings");
const fs = require("fs");
const { compress, decompress } = require("mini-lz4");
const Blob = require("buffer").Blob;


(async () => {
    const db = await open({
        filename: "./TerrainRCE_FLAT.db",
        mode: sqlite3.OPEN_READWRITE,
        driver: sqlite3.Database
    });

    const { data: dataCompressed } = await db.get(SQL`SELECT data FROM GenericData WHERE channel = 11`);

    console.log("dataCompressed", dataCompressed);
    fs.writeFileSync("./data.comp.bin", dataCompressed);

    const blobCompressed = new Blob(dataCompressed);


    // let data = decompress(Buffer.concat([new Uint8Array([0x04, 0x22, 0x4D, 0x18]), dataCompressed]));
            
    // console.log(`data`, data);
    // fs.writeFileSync("./data.bin", data);

    for (let j = blobCompressed.size; j >= 0; j--) {
        for (let i = 0; i <= blobCompressed.size; i++) {
            try{
                if (i >= j || i === 21) continue;

                // let data = decompress(await blobCompressed.slice(i, j).arrayBuffer());
                let buff = Buffer.concat([new Uint8Array([0x04, 0x22, 0x4D, 0x18]), dataCompressed.slice(i, j)]);
                console.log(i, j, buff);

                let data = decompress(buff);

                console.log(`i=${i} data`, data);
                // fs.writeFileSync("./data.bin", blob);
            } catch (ex) {
                console.error(`i=${i} failed`, ex.message);
                // throw ex;
            }
        }
    }


})();