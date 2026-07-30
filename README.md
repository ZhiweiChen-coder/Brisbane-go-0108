# Brisbane Go — 3D wildlife explorer

Brisbane Go is a playable low-poly 3D game, built for a Codex live demo. Explore an original Brisbane-inspired park, find local wildlife, and catalogue them in the Brissydex.

## Run it

This is a Vite + Three.js project. It needs Node.js 20+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Click **Enter the park** to capture the mouse, then use **WASD** to move and the mouse to look. When a creature is nearby, centre it in the crosshair and throw a visible Catch Orb with **left-click**, **Space**, or the on-screen button.

## What makes it a game

- Real WebGL 3D scene rendered by Three.js—not a static 2D map.
- First-person exploration with mouse-look and keyboard movement.
- Fifteen handcrafted low-poly local wildlife characters drawn from Brisbane's parks, riverfront, gardens, and city edges.
- Six wildlife sightings are active at once; catching one triggers a fresh random sighting somewhere else in the world.
- A visible, physics-style thrown Catch Orb and a live Brissydex.
- Discovered Brissydex entries reveal locally stored wildlife photographs; see [photo credits](PHOTO_CREDITS.md).
- Recognisable 3D Brisbane landmarks: Story Bridge, Wheel of Brisbane, Queen's Wharf, and the riverfront.
- No runtime game API, GPS, account, or Pokémon content. Brissydex photos are bundled locally after download.

## Live-demo prompts

1. `Inspect this Three.js game. Explain how player movement, the camera, and wildlife encounters work before making changes.`
2. `Make the possum wander slowly around the old fig tree. Keep the movement subtle and explain the change.`
3. `Add a small 3D South Bank landmark without downloading any assets.`
4. `Review this game for performance and input edge cases before changing anything.`
