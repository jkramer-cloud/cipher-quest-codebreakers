# Cipher Quest: Codebreakers — v2.3

A standalone, dependency-free, pixel-art codebreaking adventure for the Naches Learning Hub. Suitable for student practice in patterns, logic, cryptography, and introductory computing.

## What's new

- **15 regions / 150 missions**: the 90 existing missions plus 30 missions in three new upper regions (Sunline Canopy, Cloudglass Aerie, Celestial Apex) and 30 in three lower regions (Lantern Warrens, Obsidian Vaults, Null Chamber).
- **Animated vertical exploration**: left stairwell + W / Up climbs toward brighter skies; right stairwell + S / Down descends toward darker underground areas. Each region has three decks and distinctive environments.
- **New / Returning start**: new games offer a quick interactive Caesar-shift practice; returning agents resume their local progress, switch to Veteran mode, or enter a jump code.
- **Adaptive training**: initial missions name the cipher, the next chapters hint at its general family, and later missions conceal the method. Optional paid hints remain available.
- **Manually operated split-screen decoder**: students choose the tool, type the ciphertext, and determine any Caesar shift or keyword themselves. The decoder never submits an answer for them.
- **Classroom jump codes**, plus harmless joke codes. Jumping does **not** mark skipped missions as solved or award unearned points.
- Existing v2.2 save data is read using the same browser storage key. Choosing *New Agent* with existing progress prompts before resetting.

## Controls

| Action | Controls |
| --- | --- |
| Walk | A/D or Left/Right arrow |
| Climb stairs on the left | W or Up arrow while near left stairwell |
| Descend stairs on the right | S or Down arrow while near right stairwell |
| Decode at a station | E or interact button |
| View map / handbook / case journal | On-screen controls |
| Touchscreen | On-screen movement and interaction buttons |

## Jump codes

- `CQ-R07` goes to region 7 (Relay Tower), without marking older puzzles solved.
- `CQ-M085` goes to mission 85 (Signal Spire).
- Format: `CQ-R01` through `CQ-R15`, or `CQ-M001` through `CQ-M150`.
- Joke codes include `ANSWERSPLEASE`, `FREEA`, and `SHAREWITHFRIENDS`.

Codes are intentionally readable classroom shortcuts, **not** a security or anti-cheating mechanism. Anyone who knows the format can enter another valid mission code.

## GitHub Pages installation

1. Extract this ZIP.
2. In your `cipher-quest-codebreakers` repository, upload the extracted `index.html`, `styles.css`, `game.js`, `favicon.svg`, and `README.md` to the root, replacing their older versions.
3. Commit the changes and keep GitHub Pages enabled on the publishing branch.
4. Refresh the live game page to load v2.3.

You do **not** need to replace Learning Hub files if it already links to the same `cipher-quest-codebreakers` GitHub Pages address.

## Storage and limitations

Game progress is stored in browser `localStorage`, not a school or cloud account. A different device, browser profile, or cleared storage will not share that save automatically. Static game code runs without dependencies; student accounts are not needed. Browser testing confirmed puzzle encoding, desktop/mobile UI, code navigation, and stair movement. Save persistence in the browser's real published origin should be checked after deployment because the test sandbox restricts `localStorage` access.
