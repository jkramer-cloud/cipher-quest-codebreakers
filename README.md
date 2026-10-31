# Cipher Quest: Codebreakers — v1.0

A complete, original, 16-bit-inspired cryptography adventure for classroom use in grades 5–8. Explore three regions, decode thirty handcrafted transmissions, and unravel the mystery of the Cipher Guild and ECHO.

**Suggested GitHub description:** *Explore a pixel-art cryptography adventure! Crack 30 encrypted transmissions across 3 mysterious regions using Caesar shifts, Pigpen, Morse code, binary, and more. Designed for grades 5–8, with interactive tools, a story campaign, and automatic local saving.*

## Play and publish

1. Download and unzip `cipher-quest-codebreakers.zip`.
2. Open `index.html` to play locally, even without internet access.
3. To put the app on GitHub Pages, create a repository (for example `cipher-quest-codebreakers`) and upload all four files (`index.html`, `styles.css`, `game.js`, `favicon.svg`) at its root. Keep their names unchanged.
4. In GitHub, select **Settings → Pages → Deploy from a branch → main → /(root) → Save**. GitHub's publishing process may take several moments.
5. Add the published link to your Learning Hub when you're ready.

No npm, build tools, API keys, external art assets, libraries, network access, or school accounts are required.

## Gameplay

- **Move:** left/right arrow keys or A/D; up/down arrow keys or W/S move along the floor. On touchscreens, use the movement buttons.
- **Interact:** E while close to a station, or click a station on the canvas. Touchscreens can use the `E · INTERACT` button.
- **Navigate:** `TRACK SIGNAL` helps locate the next active station. `WORLD MAP` allows revisiting unlocked regions.
- **Decode:** read the intercepted transmission, open the Cipher Toolkit or Handbook as needed, and type the recovered plain-text message. Spaces and punctuation are optional in answers.
- **Hints:** up to three per mission; each revealed hint reduces that mission's reward by 15 points, but never prevents advancement.
- **Save:** progress, hints, badges, points, callsign, and settings are saved automatically on the device using browser localStorage. Different browsers/devices do not share saves.
- **Replay:** completed stations may be revisited without gaining extra points.

## Regions

| Region | Missions | Methods introduced |
|---|---:|---|
| The Forgotten Signal | 1–10 | Caesar shifts, Atbash, A1Z26, reversed text |
| Symbol Canyon | 11–20 | Pigpen symbols and mixed review of earlier ciphers |
| The Clockwork Archives | 21–30 | Morse, 8-bit ASCII binary, two-rail fence, layered encryption |

## Educational goals

Students will identify patterns, distinguish encoding techniques, use references strategically, practice logical reasoning, and see how a message can be represented as text, symbols, numbers, or binary. The handbook offers just-in-time explanations; answers are designed to be solvable with the integrated tools rather than external websites. Binary puzzles teach **ASCII representation**, not modern secure encryption; classical ciphers are for learning rather than real-world data protection.

## Classroom privacy and accessibility

- No analytics or remote services. No personally identifiable information required.
- The callsign is an optional nickname. Encourage students **not to enter their full names**.
- Keyboard, mouse, and touchscreen movement; clear text cues accompany color; sound optional.
- Fullscreen projector mode is available from the game toolbar where supported.
- Reduced-motion OS settings disable most interface animations; in-world motion is modest.
- Progress is local to this browser and may be removed by clearing browser data. Students who change devices will start fresh.

## Teacher tips

Use missions 1–10 for introductory letter substitution; 11–20 for visual/spatial symbols; and 21–30 as an introduction to information representation. Students can work independently or solve transmissions together on a projector. Ask learners to explain *why* a decoding method worked, not just report the final message.

## Technical details

This static site uses Canvas 2D for procedural pixel scenes, vanilla HTML/CSS/JavaScript for the controls, and browser localStorage for progress. All 30 missions and their solutions are authored in `game.js` and automatically checked against the corresponding encoding/decoding functions when the app loads. Developers may inspect `window.CipherQuestTests.validateMissions()` in the console for validation.

## Credits

Original classroom game concept and implementation generated for the Learning Hub. Fonts use system monospace families; the illustrations are drawn programmatically at runtime. No external copyrighted game assets are embedded.
