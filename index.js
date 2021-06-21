const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const SQL = require("sql-template-strings");
const fs = require("fs");
const Blob = require("buffer").Blob;
const LZ4 = require("lz4");


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

    let uncompressed = Buffer.alloc(128);

    let decompressedMessages = {}

    for (let i = 0; i <= blobCompressed.size; i++) {
        for (let j = blobCompressed.size; j >= 0; j--) {
            try{
                if (i >= j || i === 21) continue;

                // let data = decompress(await blobCompressed.slice(i, j).arrayBuffer());
                // let buff = Buffer.concat([new Uint8Array([0x04, 0x22, 0x4D, 0x18]), dataCompressed.slice(i, j)]);
                let buff = dataCompressed.slice(i, j);
                // console.log(i, j, buff);

                let uncompressedSize = LZ4.decodeBlock(buff, uncompressed)
                // console.log(uncompressedSize);
                let sliced = uncompressed.slice(0, uncompressedSize)


                let str = sliced.toString();
                // if (str.length > 0) console.log(`i=${i} j=${j} data`, str);
                // fs.writeFileSync("./data.bin", blob);

                decompressedMessages[`i=${i} j=${j}`] = str;
            } catch (ex) {
                console.error(`i=${i} failed`, ex.message);
                // throw ex;
            }
        }
        // break;
    }

    let filtered = Object.fromEntries(
        Object.entries(decompressedMessages).filter(
            ([key, value]) => {
                return value.includes("$GAME_DATA/Scripts/game/worlds/CreativeFlatWorld.lua")
            }
        )
    );

    console.log(filtered);

})();