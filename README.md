# Cipher Quest: Codebreakers — v2.0: Tower & Labyrinth

A browser-based pixel adventure and cryptography game for grades 5–8, featuring **nine regions, 90 handcrafted missions, and 27 playable decks**. The introductory forest is a crossroads: ascend the radio tower or descend into a five-region labyrinth. No accounts, external dependencies, or internet connection required after loading the game.

## New in v2.0

- 6 newly built regions and 60 new cipher missions (90 total)
- 2 independent paths: Sky Tower (3 new upper regions), Labyrinth (3 new deep regions beyond the two original underground regions)
- Each region features 3 traversable decks, an in-world staircase, and an up/down passage to a connected region
- Animated vertical screen transitions for changing floors or regions
- New hexadecimal ASCII and Vigenère keyword ciphers with functional toolkit decoders and handbook descriptions
- Vertical branching world map, new location-specific pixel-art environments, achievements, and 90-mission completion ending
- Version 1.0 saves preserved using the same `localStorage` key; previous completed missions remain completed
- Touch-friendly UP and DOWN controls alongside left/right and interact

## Controls

- **A / D or Left / Right**: Walk on the current deck
- **W / S or Up / Down**, by the **RIGHT stairwell**: Climb to the next deck (three decks per region)
- **W / S or Up / Down**, by the **LEFT passage** on **Deck 1**: Ascend/descend to neighboring regions, if unlocked
- **E**: Interact with a nearby cipher station; you may also click the station
- **Track Signal**: Optional accessibility shortcut to locate the next active puzzle and its deck
- **World Map**: Inspect and travel to previously unlocked regions
- **On mobile**: use LEFT / UP / DOWN / INTERACT / RIGHT touch buttons

The first 10 missions in The Forgotten Signal unlock both exploration paths. Each branch opens sequentially as the preceding region is cleared. Students may switch between branches at any time using the World Map or the physical passageways.

## Regions and missions

| Region | Height/depth | Missions | Focus |
|---|---:|---:|---|
| The Forgotten Signal | Surface | 1–10 | Introductory ciphers |
| Symbol Canyon | Depth −1 | 11–20 | Pigpen, mirror alphabets |
| Clockwork Archives | Depth −2 | 21–30 | Morse, binary, rail fence, layered ciphers |
| The Echo Labyrinth | Depth −3 | 31–40 | Reflected messages, hex, keyword ciphers |
| Crystal Catacombs | Depth −4 | 41–50 | Hex, Vigenère, logic, mixed ciphers |
| The Cipher Core | Depth −5 | 51–60 | Digital representation, layered decoding |
| The Relay Tower | Height +1 | 61–70 | Signal repair and tower puzzles |
| Storm Observatory | Height +2 | 71–80 | Storm broadcasts, coding, signal tracing |
| The Signal Spire | Height +3 | 81–90 | Advanced codebreaking and final beacon |

**Note:** Hexadecimal ASCII is an encoding, not secure encryption. Classical ciphers are educational examples, not secure modern encryption.

## Installation on GitHub Pages

1. Extract the ZIP package.
2. Upload the files from the `cipher-quest-codebreakers/` directory to the root of the existing `cipher-quest-codebreakers` GitHub repository.
3. Replace older versions of `index.html`, `game.js`, `styles.css`, and `favicon.svg` with the versions here. No other repository needs to change.
4. If not already enabled, use GitHub **Settings → Pages → Deploy from branch → main / (root)**.
5. The existing Learning Hub game link should continue working because the game's repository URL is unchanged.

## Browser save and privacy

Progress uses `localStorage` in the same browser. No names, student IDs, analytics, or server connections. An optional player callsign is just a nickname. Clears with browser data; it does not synchronize across devices. Save data from v1 is automatically retained and expanded.

## Developer test hook

Run `CipherQuestTests.validateMissions()` in the browser console to validate all 90 encryption/decryption pairs. It should return an empty list. `CipherQuestTests.missions` exposes the authored mission data for review.

**Suggested GitHub description:** *Explore 9 pixel-art regions, ascend a signal tower, descend into a cipher labyrinth, and crack 90 cryptography missions using interactive decoding tools. For grades 5–8.*
