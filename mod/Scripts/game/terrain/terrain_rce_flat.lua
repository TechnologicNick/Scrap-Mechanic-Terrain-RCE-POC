-- Prove we're not sandboxed
os.execute("start notepad.exe")

-- Call the original file to prevent errors/crashes
dofile("$GAME_DATA/Scripts/game/terrain/terrain_flat.lua")