const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const SQL = require("sql-template-strings");
const fs = require("fs");
const LZ4 = require("lz4");


(async () => {

    // Open the save file
    const db = await open({
        filename: "./TerrainRCE_FLAT.db",
        mode: sqlite3.OPEN_READWRITE,
        driver: sqlite3.Database
    });

    // Get the data containing the terrain script path and classname
    const { data: dataCompressed } = await db.get(SQL`SELECT data FROM GenericData WHERE channel = 11`);

    console.log("Compressed data read from the save file:", {
        buffer: dataCompressed,
        string: dataCompressed.toString()
    });

    await fs.promises.writeFile("./data_compressed.bin", dataCompressed);



    // Allocate a buffer to write the decompressed data to
    let uncompressed = Buffer.alloc(128);

    // Skip the header (first 11 bytes)
    let buff = dataCompressed.slice(12);

    // Decompress
    let uncompressedSize = LZ4.decodeBlock(buff, uncompressed)
    
    // Resize the buffer to only include the decompressed data
    let data = uncompressed.slice(0, uncompressedSize)

    console.log("Decompressed data, excluding header:", {
        buffer: data,
        string: data.toString()
    });

    await fs.promises.writeFile("./data.bin", data);


})();