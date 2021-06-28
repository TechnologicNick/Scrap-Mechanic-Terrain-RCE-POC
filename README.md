## The vulnerability
Terrain scripts have always been unsandboxed ever since they were introduced in the Challenge Mode update (0.3.3). To create a world with a terrain script you need to use the `sm.world.createWorld` function. This function can only be called from a game script environment.

To quickly show the vulnerability works we can add the following code to `CreativeGame.server_onCreate`:
```lua
sm.world.createWorld(
    "$CONTENT_637efa72-b1cc-4b16-86c3-222ecad21bcd/Scripts/game/worlds/RceFlatWorld.lua", -- Filename
    "CreativeFlatWorld", -- Classname
    nil, -- Data
    0x5EED5EED -- Seed
)
```
This creates a new world with our custom world script. The base directory of our mod is `$CONTENT_637efa72-b1cc-4b16-86c3-222ecad21bcd`, which consists of `$CONTENT_` followed by the localId of our mod.

In the world script we make the game use our custom terrain script.
```lua
-- RceFlatWorld.lua
CreativeFlatWorld.terrainScript = "$CONTENT_637efa72-b1cc-4b16-86c3-222ecad21bcd/Scripts/game/terrain/terrain_rce_flat.lua"
```

Now we've escaped the sandbox in `terrain_rce_flat.lua`:
```lua
os.execute("start notepad.exe")
```

## Exploiting the vulnerability
If we want to exploit the vulnerability in a workshop mod we don't have the luxury to simply modify game files. Therefore we have to find a different way to make our mod execute `sm.world.createWorld` in the game script environment.

### Script environment
It is possible to let arbitrary code run in a game script environment by overwriting a function that is used in a script run inside the game script environment. This can be done by hooking the function.

> **Note:** Hooking functions in lua is not a vulnerability.

If we know the function `sm.namespace.func` is being called in the script environment we want out payload to run in, we can do the following:
```lua
if not g_hookedOriginal then
    g_hookedOriginal = sm.namespace.func
end

function sm.namespace.func(...)
    
    payload()

    -- Call the original function
    return g_hookedOriginal(...)
end
```
This replaces the original function with our own. When the game calls `sm.namespace.func` our payload will be executed in the required script environment.

### Finding a function to hook
In order to execute our payload we need to find a function inside the `sm` table that is called inside the game environment and called from the server. In survival mode there are a lot of functions being called in a (fixed) update loop. Unfortunately `CreativeGame.lua` does not have any functions we can hook in the fixed update loop.

Another way to call a game script environment function is to use `sm.event.sendToGame`. This function takes a function name and a data parameter. We can use this to call `CreativeGame.<function_name>` functions that are not blacklisted.

A function that can be used for this is `CreativeGame.client_showMessage`. Although the name of the function suggests it can only be executed client-side, executing it server-side works just fine.
```lua
function CreativeGame.client_showMessage( self, params )
	sm.gui.chatMessage( params )
end
```
Now we can hook `sm.gui.chatMessage` and call it using `sm.event.sendToGame("client_showMessage", "Hooked")`.

## Proof of concept
I've made an [example script](https://github.com/TechnologicNick/Scrap-Mechanic-Terrain-RCE-POC/blob/master/mod/Scripts/ExploitPart.lua) that can be used to exploit the vulnerability. Interacting with the part will hook `sm.gui.chatMessage`, trigger the `CreativeGame.client_showMessage` event, execute the payload and restore everything to the way it was before. The terrain script is loaded 8 times by the game so 8 new instances of `notepad.exe` will be spawned.