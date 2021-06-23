dofile( "$GAME_DATA/Scripts/game/worlds/CreativeBaseWorld.lua")

print([[
    =======================
    Loaded RceFlatWorld.lua
    =======================
]])

RceFlatWorld = class( CreativeBaseWorld )

RceFlatWorld.terrainScript = "$CONTENT_637efa72-b1cc-4b16-86c3-222ecad21bcd/Scripts/game/terrain/terrain_rce_flat.lua"
RceFlatWorld.enableSurface = true
RceFlatWorld.enableAssets = true
RceFlatWorld.enableClutter = true
RceFlatWorld.enableCreations = false
RceFlatWorld.enableNodes = false
RceFlatWorld.enableHarvestables = false
RceFlatWorld.groundMaterialSet = "$GAME_DATA/Terrain/Materials/gnd_flat_materialset.json"
RceFlatWorld.cellMinX = -16
RceFlatWorld.cellMaxX = 15
RceFlatWorld.cellMinY = -16
RceFlatWorld.cellMaxY = 15