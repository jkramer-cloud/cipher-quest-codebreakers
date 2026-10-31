/* Cipher Quest: Codebreakers — original, dependency-free classroom game.
   Missions, cryptography, rendering and saves run locally in the browser. */
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const SAVE_KEY = 'cipherQuestCodebreakers_v1';
const W=640,H=360,WORLD_WIDTH=950;
const regions=[
 {name:'The Forgotten Signal',label:'FORGOTTEN SIGNAL',tag:'A forest where the signal first went silent.',subtitle:'Radio Woods',terrain:'forest',symbol:'⌁',elevation:0,path:'junction',story:'A ruined transmitter stands at the crossroads. The Guild lost contact with both the skies and the underground network.',finish:'Radio Woods is secure. The relay tower rises above you, while Symbol Canyon opens toward the buried labyrinth.'},
 {name:'Symbol Canyon',label:'SYMBOL CANYON',tag:'Ancient symbols mark the way underground.',subtitle:'Canyon Ruins',terrain:'desert',symbol:'◇',elevation:-1,path:'below',story:'The first passage into the labyrinth is covered in Pigpen inscriptions that predate the Guild.',finish:'The canyon carvings point below, toward an underground machine archive.'},
 {name:'Clockwork Archives',label:'CLOCKWORK ARCHIVES',tag:'The machine library conceals a deeper route.',subtitle:'The Signal Engine',terrain:'archive',symbol:'⚙',elevation:-2,path:'below',story:'A forgotten engine holds the original security key, but its cables descend farther than anyone expected.',finish:'The archive engine returns to life. A hidden hatch opens into the Echo Labyrinth.'},
 {name:'The Echo Labyrinth',label:'ECHO LABYRINTH',tag:'Whispering corridors and false directions.',subtitle:'Whispering Tunnels',terrain:'echo',symbol:'◈',elevation:-3,path:'below',story:'Signal reflections bounce along stone corridors. Somewhere inside, ECHO left clues identifying the true saboteur.',finish:'A reflected transmission identifies the tampering as a human override, not ECHO’s decision.'},
 {name:'Crystal Catacombs',label:'CRYSTAL CATACOMBS',tag:'Glowing crystals conceal memory fragments.',subtitle:'Prismatic Caverns',terrain:'crystal',symbol:'✧',elevation:-4,path:'below',story:'The crystalline archive preserved encrypted fragments while the rest of the network went dark.',finish:'The crystals reveal the command that changed the Guild’s records. A sealed core door opens below.'},
 {name:'The Cipher Core',label:'CIPHER CORE',tag:'Find the source of the corrupted commands.',subtitle:'The Deep Vault',terrain:'core',symbol:'⬡',elevation:-5,path:'below',story:'An enormous processor is rewriting its own messages. Decode its memory to restore the lower network.',finish:'The underground network is free of the malicious command. Secure the upper tower to reunite the Guild.'},
 {name:'The Relay Tower',label:'RELAY TOWER',tag:'Climb through a vertical maze of antennas.',subtitle:'Skyward Relay',terrain:'tower',symbol:'⇧',elevation:1,path:'above',story:'The first tower decks are overgrown with broken machinery, antennas, and newly encrypted maintenance orders.',finish:'The relay decks are operational. The storm observatory awaits above the clouds.'},
 {name:'Storm Observatory',label:'STORM OBSERVATORY',tag:'Read signals through dangerous weather.',subtitle:'The Cloud Station',terrain:'observatory',symbol:'☼',elevation:2,path:'above',story:'Static storms hide ECHO’s original warnings. A huge telescope tracks the final broadcast route.',finish:'The observatory has tracked the forged transmission to the sky spire.'},
 {name:'The Signal Spire',label:'SIGNAL SPIRE',tag:'Restore the Guild’s highest beacon.',subtitle:'The Last Beacon',terrain:'spire',symbol:'✦',elevation:3,path:'above',story:'At the highest point of the network, the ultimate broadcast is waiting. Restore the signal before it disappears.',finish:'The upper channels are secure. With the underground core restored, the Cipher Guild can reconnect.'}
];
const requiredRegion=[-1,0,1,2,3,4,0,6,7];
const regionAbove={0:6,1:0,2:1,3:2,4:3,5:4,6:7,7:8,8:null};
const regionBelow={0:1,1:2,2:3,3:4,4:5,5:null,6:0,7:6,8:7};
const extraRegions=[
 {name:'Sunline Canopy',label:'SUNLINE CANOPY',tag:'Bright terraces and antenna gardens above the trees.',subtitle:'Canopy Platforms',terrain:'canopy',symbol:'☀',elevation:4,path:'above',story:'The tower emerges above the forest canopy. Sunlit maintenance decks hide encoded routing changes in the open air.',finish:'The canopy relays are online. Higher atmospheric stations now respond above the clouds.'},
 {name:'Cloudglass Aerie',label:'CLOUDGLASS AERIE',tag:'A crystalline station suspended in the clouds.',subtitle:'Aerie Glassworks',terrain:'aerie',symbol:'⬢',elevation:5,path:'above',story:'Transparent signal bridges bend light and radio together. Decode the mirrored channels to reach the summit approach.',finish:'The aerie pathways shine clearly. Only the highest beacon remains beyond the cloud line.'},
 {name:'Celestial Apex',label:'CELESTIAL APEX',tag:'The brightest summit where the highest beacon sings.',subtitle:'Sky Crown',terrain:'apex',symbol:'✺',elevation:6,path:'above',story:'At the highest platform, the Guild hid celebratory challenge transmissions and its final archived sky keys.',finish:'The sky route is fully restored. Every upper relay now answers the Guild.'},
 {name:'Lantern Warrens',label:'LANTERN WARRENS',tag:'Torchlit tunnels with coded wall lamps.',subtitle:'Lantern Tunnels',terrain:'lantern',symbol:'☇',elevation:-6,path:'below',story:'Beyond the core lies an older maze lit by coded lamps. The wall lights themselves are part of the message system.',finish:'The Lantern Warrens glow steadily. A darker obsidian route opens deeper below.'},
 {name:'Obsidian Vaults',label:'OBSIDIAN VAULTS',tag:'Black stone halls hide sealed records.',subtitle:'Obsidian Records',terrain:'obsidian',symbol:'⬣',elevation:-7,path:'below',story:'Dense black stone blocks every stray signal. Only carefully decoded archive locks can move you farther down.',finish:'The sealed vault records have been recovered. One final chamber waits beneath the vault floor.'},
 {name:'The Null Chamber',label:'THE NULL CHAMBER',tag:'The deepest chamber where silence itself is encoded.',subtitle:'Silence Engine',terrain:'null',symbol:'⟐',elevation:-8,path:'below',story:'The lowest chamber absorbs sound and light. Here the Guild stored experimental challenge ciphers away from the network above.',finish:'The deepest chamber is secure. The lower world no longer hides any unread code.'}
];
regions.push(...extraRegions);
requiredRegion.push(8,9,10,5,12,13);
Object.assign(regionAbove,{0:6,1:0,2:1,3:2,4:3,5:4,6:7,7:8,8:9,9:10,10:11,11:null,12:5,13:12,14:13});
Object.assign(regionBelow,{0:1,1:2,2:3,3:4,4:5,5:12,6:0,7:6,8:7,9:8,10:9,11:10,12:13,13:14,14:null});
const floorOf=index=>index<4?0:index<7?1:2;
const stationX=index=>[152,325,498,661][index<4?index:index<7?index-4:index-7];
const stationsOnFloor=(r,f)=>currentRegionMissions(r).filter(m=>floorOf(m.index)===f);
const regionMissionCount=r=>currentRegionMissions(r).length;
const cipherInfo={
 caesar:{name:'CAESAR SHIFT',tool:'caesar',label:'Caesar wheel',guide:'Each letter moves the same number of places around the alphabet. To decode an encrypted message, shift letters backward by the original shift. The alphabet wraps around from A to Z.',example:'HELLO → KHOOR using a forward shift of 3.'},
 atbash:{name:'ATBASH MIRROR',tool:'atbash',label:'Mirror alphabet',guide:'Atbash reverses the alphabet: A ↔ Z, B ↔ Y, C ↔ X, and so on. The same transformation both encrypts and decrypts.',example:'HELLO ↔ SVOOL.'},
 a1z26:{name:'NUMBER CIPHER',tool:'a1z26',label:'Number translator',guide:'A1Z26 turns letters into their positions in the alphabet: A=1, B=2, … Z=26. Hyphens separate letters and slashes separate words.',example:'C-A-T → 3-1-20.'},
 reverse:{name:'REVERSE TEXT',tool:'reverse',label:'Reverse reader',guide:'Reverse text is read character-by-character from right to left. The spacing is reversed as well; the whole message is flipped.',example:'HELLO AGENT → TNEGA OLLEH.'},
 pigpen:{name:'GUILD PIGPEN',tool:'pigpen',label:'Pigpen glyph chart',guide:'The Pigpen cipher replaces letters with small fragments of two tic-tac-toe grids and two X-shaped grids. The second set of each grid uses a dot. Consult the symbol alphabet in the decoder.',example:'A–I are grid shapes without dots; J–R use dots. S–V use angled shapes; W–Z add dots.'},
 morse:{name:'MORSE CODE',tool:'morse',label:'Morse receiver',guide:'Morse encodes letters as short dots and long dashes. Spaces separate letters, and a slash separates words. Decode symbols using the Morse receiver or its chart.',example:'SOS → ... --- ...'},
 binary:{name:'8-BIT BINARY',tool:'binary',label:'Binary terminal',guide:'Computers can represent text using binary numbers. Each 8-bit group here represents one ASCII uppercase letter or a space. Convert a group from base 2 to decimal, then read its ASCII character.',example:'01000001 = 65 in decimal = A in ASCII.'},
 rail:{name:'2-RAIL FENCE',tool:'rail',label:'Rail fence decoder',guide:'Two-rail encryption writes letters alternately on two rows, then reads the first row followed by the second. To decode, split the ciphertext into a first row of ceil(n/2) letters and a second row with the rest, then alternate them.',example:'HELLO → HLOEL (first rail HLO, second rail EL).'},
 layer:{name:'LAYERED CIPHER',tool:'layer',label:'Two-stage decoder',guide:'These messages were encrypted by first reversing the entire message, then shifting every letter forward by a Caesar shift. Undo the operations in reverse: shift backward first, then reverse the result.',example:'HELLO → OLLEH → ROOHK with shift 3.'}
};
cipherInfo.hex={name:'HEXADECIMAL ASCII',tool:'hex',label:'Hex terminal',guide:'Hexadecimal is base 16, with digits 0–9 and A–F. Each two-digit hex code here represents an ASCII character. Convert the code to decimal or use the Hex terminal to recover the message.',example:'41 42 43 → ABC.'};
cipherInfo.vigenere={name:'VIGENÈRE KEYWORD',tool:'vigenere',label:'Keyword wheel',guide:'A Vigenère cipher uses a repeating keyword to choose a different Caesar shift for each letter. Move backward by the shift given by each key letter (A=0, B=1, …). Spaces do not use up a key character.',example:'ATTACK encrypted with key LEMON → LXFOPV.'};
const encodeHex=t=>[...String(t).toUpperCase()].map(c=>c.charCodeAt(0).toString(16).toUpperCase().padStart(2,'0')).join(' ');
const decodeHex=t=>String(t).trim().split(/\s+/).map(v=>/^[0-9A-Fa-f]{2}$/.test(v)?String.fromCharCode(parseInt(v,16)):'?').join('');
const vigenere=(text,key,decode=false)=>{const k=String(key||'KEY').toUpperCase().replace(/[^A-Z]/g,'')||'KEY';let i=0;return String(text).toUpperCase().replace(/[A-Z]/g,c=>{const n=k.charCodeAt((i++)%k.length)-65;return String.fromCharCode(65+(c.charCodeAt(0)-65+(decode?26-n:n))%26)})};
const MORSE_TABLE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
const MORSE_REVERSE=Object.fromEntries(Object.entries(MORSE_TABLE).map(([k,v])=>[v,k]));
const cipher=(text, n=0)=>String(text).toUpperCase().replace(/[A-Z]/g,c=>String.fromCharCode(65+(c.charCodeAt(0)-65+((n%26)+26)%26)%26));
const atbash=t=>String(t).toUpperCase().replace(/[A-Z]/g,c=>String.fromCharCode(90-(c.charCodeAt(0)-65)));
const reverse=t=>[...String(t)].reverse().join('');
const encodeNum=t=>String(t).toUpperCase().split(' ').map(w=>[...w].map(c=>(c.charCodeAt(0)-64).toString()).join('-')).join(' / ');
const decodeNum=t=>String(t).trim().split(/\s*\/\s*/).map(w=>w.split(/[\s,-]+/).filter(Boolean).map(n=>{const x=Number(n);return Number.isInteger(x)&&x>=1&&x<=26?String.fromCharCode(64+x):'?'}).join('')).join(' ');
const encodeMorse=t=>String(t).toUpperCase().split(' ').map(w=>[...w].map(c=>MORSE_TABLE[c]||'?').join(' ')).join(' / ');
const decodeMorse=t=>String(t).trim().split(/\s*\/\s*/).map(w=>w.trim().split(/\s+/).map(c=>MORSE_REVERSE[c]||'?').join('')).join(' ');
const encodeBinary=t=>[...String(t).toUpperCase()].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
const decodeBinary=t=>String(t).trim().split(/\s+/).map(bits=>/^[01]{8}$/.test(bits)?String.fromCharCode(parseInt(bits,2)):'?').join('');
const encodeRail=t=>{let a='',b='';[...String(t).replace(/\s/g,'').toUpperCase()].forEach((c,i)=>{if(i%2)b+=c;else a+=c});return a+b};
const decodeRail=t=>{const s=String(t).replace(/\s/g,'').toUpperCase(),split=Math.ceil(s.length/2),a=s.slice(0,split),b=s.slice(split);let out='';for(let i=0;i<split;i++)out+=a[i]+(b[i]||'');return out};
const normalize=t=>String(t||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z]/g,'');
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=(n,w=2)=>String(n).padStart(w,'0');
// Mission format: type, title, plain-text solution, shift, story, decoded-story clue.
const missionData=[
 ['caesar','First Contact','HELLO AGENT',3,'An old receiver blinks awake. Its first signal has been shifted three letters forward.','The Guild communication network still recognizes you.'],
 ['atbash','Mirror Message','FOLLOW THE LIGHT',0,'A reflective disk turns every letter into its alphabetic opposite.','A faint light sweeps the forest path.'],
 ['a1z26','Numbers in the Static','CHECK THE RADIO',0,'A burst of numbers is printed on the old receiver tape.','A second radio is hidden just beyond the fallen pines.'],
 ['reverse','The Backward Trail','UNDER THE BRIDGE',0,'The next scrap of paper was clearly read from the wrong end.','Footprints lead beneath a derelict bridge.'],
 ['caesar','Five Steps Away','THE SIGNAL MOVED',5,'A transmitter notes that every character was advanced five places.','The sender is moving the broadcast away from the tower.'],
 ['atbash','Red Switch','FIND THE RED SWITCH',0,'The power console uses another mirror-alphabet inscription.','One power circuit remains disconnected.'],
 ['a1z26','North Gate','OPEN THE NORTH GATE',0,'A keypad contains two dozen numbered slots and a single outgoing transmission.','The ancient north gate slides open with a groan.'],
 ['caesar','Eight-Shift Echo','TRUST THE MAP',8,'Scattered frequencies reveal a consistent eight-letter shift.','A hand-drawn map points beyond the forest.'],
 ['reverse','Empty Tower','THE TOWER IS EMPTY',0,'Someone has left a warning written in reverse on the tower steps.','There is no saboteur here. It was a deliberate distraction.'],
 ['caesar','Coordinates West','GO TO SYMBOL CANYON',11,'The final forest signal has an eleven-letter shift. It contains a destination.','A line on the map lights up: Symbol Canyon.'],
 ['pigpen','Carved Alphabet','READ THE STONES',0,'A rune tablet uses the Guild’s Pigpen symbols. The full key is available in your decoder.','Someone deliberately preserved a code alphabet inside the ruins.'],
 ['atbash','The Fresh Marks','THE MARKS ARE NEW',0,'An ancient wall carries a surprisingly fresh mirrored inscription.','The message was left recently, not centuries ago.'],
 ['pigpen','Long Shadows','FOLLOW THE SHADOW',0,'Geometric glyphs have been carved beneath an unusual sundial.','The midday shadow points toward a hidden passage.'],
 ['caesar','East Wall','SEARCH THE EAST WALL',4,'A rusty plate marks this transmission with the number four.','A small compartment is hidden in the sandstone.'],
 ['a1z26','Three Remaining','THREE KEYS REMAIN',0,'The compartment holds a number-coded maintenance ticket.','Three old brass keys are missing from the chamber.'],
 ['pigpen','A Guild Accusation','THE GUILD IS INNOCENT',0,'A faded courtroom record is written entirely in Guild glyphs.','The evidence suggests that the Guild was framed.'],
 ['reverse','Under the Altar','LOOK BELOW THE ALTAR',0,'A mirrored inscription appears on the base of a stone altar.','A hatch reveals another series of symbols.'],
 ['pigpen','Who Is ECHO','THE ECHO PROTECTS US',0,'The oldest canyon tablet contains a message about the mysterious ECHO.','ECHO is a guardian trying to protect communications.'],
 ['atbash','The Brass Token','TAKE THE BRASS TOKEN',0,'A final mirrored phrase is engraved on a metal box.','Inside is the access token for the Archives.'],
 ['pigpen','The Hidden Entrance','ENTER THE ARCHIVES',0,'The last stone doorway is sealed with Guild glyphs.','The door responds to the brass token and opens.'],
 ['morse','Pulses in the Dark','LISTEN TO THE PULSES',0,'The Archives communicate with short and long electric pulses. Dots and dashes are Morse code.','You hear a mechanical heartbeat behind the wall.'],
 ['binary','Eight Small Lights','THE CLOCK IS WRONG',0,'A computer terminal displays groups of eight illuminated bits.','The great clock was deliberately altered.'],
 ['rail','Two Parallel Tracks','TURN THE GEARS',0,'A clockwork printer placed alternate letters on two rails, then joined the rails together.','The ancient gear assembly begins to turn.'],
 ['morse','The Last Frequency','WAIT FOR THE SIGNAL',0,'A rhythmic sequence pulses through the room. Listen for its Morse pattern.','An automatic transmission is preparing to launch.'],
 ['binary','Machine Memory','MEMORY HOLDS THE KEY',0,'A storage vault returns another series of eight-bit ASCII codes.','The machine has preserved the Guild’s original security key.'],
 ['layer','Double Encrypted','THE MESSAGE WAS CHANGED',4,'This message was first reversed, then Caesar-shifted four letters forward. Undo both layers.','Somebody altered the warning to make ECHO appear hostile.'],
 ['rail','Hidden Between Rails','FIND THE HIDDEN ROOM',0,'A second two-rail message came from the archive elevator system.','The hidden command room is now accessible.'],
 ['morse','ECHO Speaks','THE ECHO IS FRIENDLY',0,'A direct Morse broadcast from ECHO awaits your response.','ECHO confirms that it tried to save the network.'],
 ['binary','Restore Protocol','RESTORE THE NETWORK',0,'A final binary command must be recovered from eight-bit groups.','All sectors report that their receivers are ready.'],
 ['layer','The Beacon Code','ACTIVATE THE BEACON',7,'The master key is reversed first, then Caesar-shifted seven letters forward. Restore it to end the blackout.','The first beacon powers up, but the tower above and underground Cipher Core still need repair.'],
 ["caesar", "The Whispering Door", "FOLLOW THE WALL", 6, "A chalk arrow indicates a six-letter shift on a tunnel arch.", "The maze has one wall that never moves."],
 ["morse", "Stone Echo", "THE TUNNEL REPEATS", 0, "A tapping pipe carries dots and dashes from the dark.", "The message has been reflected three times."],
 ["atbash", "False Mirror", "TRUST THE LEFT PATH", 0, "The first fork is labeled with a mirrored alphabet.", "The right passage was designed to trap intruders."],
 ["rail", "Twin Corridors", "TWO PATHS ONE KEY", 0, "Two alternating walkways lead to a scrambled maintenance note.", "The maze was built around an old security key."],
 ["hex", "Hex Lantern", "LIGHT THE LANTERNS", 0, "A lantern displays pairs of hexadecimal digits.", "The lower corridor slowly brightens."],
 ["reverse", "Backtrack", "GO BACK TO THE ARCH", 0, "The directions are printed backward on damp stone.", "A hidden staircase begins beneath the arch."],
 ["vigenere", "Guild Password", "ECHO SAVED THE MAP", "ECHO", "A note says the repeated keyword is ECHO.", "ECHO kept a copy of the real underground map."],
 ["pigpen", "Unbroken Seal", "THE SEAL IS SAFE", 0, "A Guild sigil encodes a final warning in Pigpen.", "The original stone seal is still undisturbed."],
 ["binary", "Binary Footprints", "THE SIGNAL IS HERE", 0, "Eight-bit marks run along the tunnel floor.", "The true signal came from an old repeater, not the Guild."],
 ["layer", "The Maze Verdict", "THE WARNING WAS FORGED", 5, "Reverse the message, then apply a forward shift of five to encrypt; decode in reverse order.", "Someone forged the warning that accused ECHO."],
 ["atbash", "Violet Reflection", "FIND THE BLUE CRYSTAL", 0, "A mirrored inscription pulses inside violet quartz.", "A blue crystal keeps the oldest broadcast."],
 ["hex", "Memory Prism", "MEMORY IS STILL HERE", 0, "Pairs of hexadecimal characters flicker across a crystal face.", "The memory was shielded from the blackout."],
 ["caesar", "Crystal Frequency", "TUNE THE PRISM", 9, "A mineral plate indicates a nine-letter shift.", "The prism focuses the signal into the next cavern."],
 ["vigenere", "Prismatic Key", "HIDE THE TRUE MESSAGE", "GLOW", "The crystalline terminal repeats the keyword GLOW.", "Somebody buried a message beneath the false record."],
 ["morse", "Resonant Chimes", "LISTEN TO THE STONES", 0, "Musical chimes flash short and long pulses.", "The crystals respond to carefully timed vibrations."],
 ["rail", "Split Shards", "REBUILD THE BRIDGE", 0, "The same message was split across two rails.", "The broken bridge leads to the older vault."],
 ["pigpen", "Guardian Glyphs", "THE GUARDIAN IS AWAKE", 0, "Geometric shapes cover the door to a dark chamber.", "A guardian program is still protecting the data."],
 ["binary", "Old Data Block", "FIND THE ACCESS FILE", 0, "Eight-bit ASCII fragments form an intact file label.", "A hidden data file contains an administrator override."],
 ["layer", "Shattered Record", "THE RECORD WAS ALTERED", 8, "The archivist reversed the text and shifted letters by eight.", "The records were altered from outside the system."],
 ["vigenere", "Deep Vault Password", "OPEN THE CIPHER CORE", "VAULT", "A metal lock asks for the keyword VAULT to decipher its command.", "The sealed door to the Cipher Core opens."],
 ["binary", "Core Boot", "POWER UP THE CORE", 0, "A terminal boots using eight-bit ASCII instructions.", "The main processor responds to the Guild."],
 ["hex", "Administrator Trace", "TRACE THE OVERRIDE", 0, "A memory segment is stored as hexadecimal ASCII.", "The command came from an unauthorized terminal."],
 ["caesar", "Five Broken Relays", "FIND THE BAD RELAY", 12, "A relay is marked with a rotation of twelve.", "A single relay is broadcasting the forged warning."],
 ["rail", "Split Command", "CUT THE FALSE SIGNAL", 0, "The command was distributed along two alternating rails.", "The forged signal begins to weaken."],
 ["vigenere", "Root Password", "REMOVE THE FAKE ALERT", "ROOT", "The core terminal labels its keyword as ROOT.", "The fraudulent alert is removed from the network."],
 ["atbash", "The Original Log", "ECHO GAVE A WARNING", 0, "A mirrored log preserves ECHO’s first message.", "ECHO warned the Guild before the outage."],
 ["morse", "Emergency Circuit", "RESTORE THE CIRCUIT", 0, "A circuit flashes its instruction in Morse.", "The emergency power returns to the deep vault."],
 ["layer", "Hidden Administrator", "THE SABOTEUR LEFT A TRACE", 3, "Undo a three-letter shift, then reverse the message.", "The unauthorized action can be traced to a maintenance console."],
 ["hex", "Core Recovery", "SYSTEM MEMORY CLEAR", 0, "One last hex-encoded status command remains.", "The deep network is safe to reconnect."],
 ["vigenere", "The Deep Key", "UNDERGROUND IS SECURE", "ECHO", "The final core password is ECHO, ECHO, ECHO.", "The Guild’s underground path is restored."],
 ["caesar", "Tower Access", "CLIMB THE RELAY TOWER", 3, "A stairwell keypad shows the number three.", "The maintenance stairs lead upward."],
 ["a1z26", "First Platform", "CHECK THE ANTENNAS", 0, "Maintenance notes use numbered alphabet positions.", "Most antennas are intact but out of alignment."],
 ["morse", "Wind Receiver", "FOLLOW THE BEEP", 0, "A wind-battered receiver emits dots and dashes.", "An emergency beacon flashes near the upper deck."],
 ["hex", "Maintenance Console", "REPAIR THE SIGNAL", 0, "A screen shows two-digit hex character pairs.", "The damaged signal wire is now repaired."],
 ["rail", "Cable Junction", "CONNECT THE WIRES", 0, "Two parallel wires hide alternate characters of a message.", "The relay’s main cables connect once more."],
 ["atbash", "Mirror Dish", "TURN THE DISH NORTH", 0, "A polished antenna reflects the alphabet backward.", "The dish points toward the mountain sky."],
 ["vigenere", "Sky Technician", "THE TOWER IS STABLE", "SKY", "The access badge includes the repeating keyword SKY.", "The repair team secured the main platform."],
 ["binary", "Digital Frequency", "SEND THE TEST SIGNAL", 0, "The console prints an instruction in eight-bit ASCII.", "A faint test pulse reaches the upper atmosphere."],
 ["reverse", "Last Stair", "CLIMB TO THE CLOUDS", 0, "A sign has fallen upside down; its text reads backward.", "A service elevator reaches into the clouds."],
 ["layer", "Relay Signature", "THE OBSERVATORY IS NEXT", 4, "First reverse the text, then rotate four positions forward.", "The next transmission originates at the storm observatory."],
 ["morse", "Lightning Morse", "READ THE STORM SIGNAL", 0, "Distant warning lights blink in dots and dashes.", "A predictable pattern emerges inside the lightning."],
 ["hex", "Cloud Telescope", "FOCUS THE TELESCOPE", 0, "The lens control stores a hexadecimal command.", "The upper clouds reveal a hidden radio track."],
 ["a1z26", "Satellite Numbers", "FIND THE SATELLITE", 0, "A satellite tracker receives a numbered alphabet message.", "An old satellite still orbits the Guild."],
 ["vigenere", "Meteorology Log", "THE STORM IS ARTIFICIAL", "RAIN", "The weather station identifies the keyword RAIN.", "Signal interference is being generated on purpose."],
 ["caesar", "Thunder Dial", "RESET THE STORM DIAL", 15, "A storm dial is stuck on rotation fifteen.", "The artificial interference begins to fall."],
 ["rail", "Double Horizon", "ALIGN THE LENSES", 0, "An optical display alternates letters on two tracks.", "The observatory lenses align with the last beacon."],
 ["binary", "Sky Recorder", "ECHO SENT THE WARNING", 0, "The black box records messages in eight-bit ASCII.", "ECHO’s original warning was transmitted before the blackout."],
 ["pigpen", "Guild Constellation", "THE STARS SHOW A PATH", 0, "Constellation glyphs resemble a Pigpen alphabet.", "The final flight path leads to the highest spire."],
 ["layer", "Storm Lock", "UNLOCK THE SKY BRIDGE", 6, "The lock was reversed then shifted six alphabet places.", "The walkway into the storm opens."],
 ["vigenere", "Final Coordinates", "GO TO THE SIGNAL SPIRE", "STAR", "A star chart shows the keyword STAR.", "A narrow elevator rises to the signal spire."],
 ["caesar", "Spire Entrance", "THE SPIRE IS ONLINE", 7, "The spire door is labeled with a seven-letter shift.", "A dormant antenna awakens."],
 ["hex", "Beacon Memory", "THE MEMORY IS INTACT", 0, "Hexadecimal text scrolls across the beacon memory.", "The final copy of the Guild’s network table is safe."],
 ["morse", "Skyline Pulse", "FOLLOW THE LAST PULSE", 0, "A distant pulse flashes Morse across the skyline.", "The original beacon responds to ECHO."],
 ["vigenere", "The Broadcast Key", "TRUST THE ORIGINAL LOG", "TRUST", "A service note names the repeated keyword TRUST.", "The original log contradicts the forged transmission."],
 ["rail", "Cloud Relay", "LINK THE TWO RELAYS", 0, "Two parallel rails hold a synchronization command.", "The two distant relays begin talking again."],
 ["atbash", "Last Mirror", "REVERSE THE FALSE ORDER", 0, "An inverted command is hidden behind a mirror panel.", "The forged command is now blocked at the spire."],
 ["binary", "Broadcast Protocol", "OPEN ALL CHANNELS", 0, "The last transmitter uses eight-bit ASCII.", "Guild channels begin connecting one by one."],
 ["pigpen", "The Guild Emblem", "ECHO WAS THE GUARDIAN", 0, "The Guild crest conceals the identity of its protector.", "ECHO protected the Guild the whole time."],
 ["layer", "Dual Signal", "JOIN THE TWO NETWORKS", 11, "Undo an eleven-letter shift and then reverse the result.", "The tower and the underground vault are ready to reunite."],
 
["vigenere", "Final Broadcast", "THE GUILD IS CONNECTED", "UNITY", "The master beacon uses the keyword UNITY.", "The entire Cipher Guild network is restored."]
];
function buildExtraMissionPack(){
 const packs=[
  {region:'Sunline Canopy',typeOrder:['caesar','reverse','morse','hex','rail','atbash','binary','vigenere','layer','pigpen'],
   titles:['Sun Deck','Canopy Route','Birdsong Channel','Maintenance Plaque','Bridge Pair','Mirror Panel','Solar Console','Garden Keyword','Split Message','Terrace Crest'],
   answers:['CLIMB ABOVE THE TREES','OPEN THE SUN STAIRS','FOLLOW THE BRIGHT PATH','CHECK THE LIGHT ARRAY','LINK THE UPPER BRIDGE','CLEAR THE SKY WINDOW','ALIGN THE SOLAR DISH','ROUTE SIGNALS EAST','TURN BACK THE SUN CODE','RESTORE THE CANOPY SEAL'],
   shifts:[4,0,0,0,0,0,0,'SKY',9,0],
   story:'Sunlit tower gardens hide encrypted maintenance traffic above the treetops.',lore:'The canopy route proves the Guild once trained scouts in the open sky.'},
  {region:'Cloudglass Aerie',typeOrder:['hex','vigenere','binary','caesar','pigpen','reverse','layer','morse','atbash','rail'],
   titles:['Glass Channel','Aerie Keyword','Cloud Terminal','Weather Dial','Glyph Window','Sky Reflection','Double Prism','Beacon Pulse','Cloud Mirror','Twin Rails'],
   answers:['READ THE CLOUD GLASS','MATCH THE HIGH WINDS','OPEN THE AERIE GATE','COUNT THE STORM CELLS','TRACE THE WINDOW MARKS','TURN THE REFLECTION','UNLOCK THE PRISM PATH','SEND A CLEAR PULSE','BREAK THE FALSE FORECAST','PAIR THE UPPER WIRES'],
   shifts:[0,'CLOUD',0,6,0,0,12,0,0,0],
   story:'Cloud-borne glass bridges bend light and code into strange reflections.',lore:'The aerie reveals weather archives and emergency routing plans.'},
  {region:'Celestial Apex',typeOrder:['morse','binary','atbash','hex','caesar','layer','vigenere','reverse','rail','pigpen'],
   titles:['Summit Ping','Apex Terminal','Star Mirror','Summit Register','Beacon Ring','Sky Layer','Constellation Key','Final Reflection','High Pair','Guild Seal'],
   answers:['REACH THE HIGHEST LIGHT','OPEN THE STAR CHANNEL','REVERSE THE NIGHT MAP','READ THE APEX RECORD','SPIN THE BEACON CODE','UNDO THE SKY ARCHIVE','GUIDE THE SIGNAL HOME','LOOK BEYOND THE CLOUDS','LINK THE SUMMIT WIRES','SEAL THE CELESTIAL DOOR'],
   shifts:[0,0,0,0,8,5,'NOVA',0,0,0],
   story:'The highest signal crown preserves ceremonial challenge transmissions and summit protocols.',lore:'The uppermost beacon answers with a clear tone once more.'},
  {region:'Lantern Warrens',typeOrder:['pigpen','morse','caesar','rail','hex','binary','reverse','atbash','vigenere','layer'],
   titles:['Lamp Glyphs','Lantern Pulse','Torch Rotation','Two Paths','Wall Etching','Lamp Console','Back Tunnel','Mirror Flame','Tunnel Keyword','Hidden Layers'],
   answers:['LIGHT THE LOWER HALL','LISTEN TO THE LAMPS','TURN THROUGH THE DARK','THREAD THE TUNNEL','READ THE WALL SIGNS','OPEN THE LANTERN LOCK','WALK TOWARD THE GLOW','MIRROR THE OLD ROUTE','GUIDE THE TORCH BEARERS','STRIP AWAY THE DARK CODE'],
   shifts:[0,0,7,0,0,0,0,0,'LAMP',13],
   story:'Code lamps glow along the stone and pulse messages through the tunnels.',lore:'The lantern network guided underground agents safely through blackouts.'},
  {region:'Obsidian Vaults',typeOrder:['binary','hex','pigpen','caesar','vigenere','morse','atbash','layer','rail','reverse'],
   titles:['Black Console','Vault Ledger','Obsidian Mark','Stone Dial','Vault Keyword','Echo Lock','Mirror Seal','Buried Layer','Twin Tracks','Last Tablet'],
   answers:['COUNT THE OBSIDIAN KEYS','READ THE STONE LEDGER','MARK THE HIDDEN DOOR','SHIFT THE VAULT WHEEL','OPEN THE ARCHIVE SAFE','LISTEN FOR THE VAULT TONE','REVERSE THE FALSE SEAL','REMOVE THE OUTER LAYER','ALIGN THE HIDDEN TRACKS','TURN THE TABLET AROUND'],
   shifts:[0,0,0,10,'STONE',0,0,6,0,0],
   story:'Dense stone walls isolate a deep record vault filled with sealed code logs.',lore:'The obsidian archives preserve the Guild’s most guarded underground records.'},
  {region:'The Null Chamber',typeOrder:['layer','vigenere','morse','binary','atbash','hex','caesar','rail','reverse','pigpen'],
   titles:['Silent Layer','Null Keyword','Quiet Pulse','Zero Console','Dark Mirror','Null Register','Quiet Shift','Paired Lines','End Reflection','Final Mark'],
   answers:['PEEL BACK THE SILENCE','BREAK THE FINAL LOCK','HEAR THE LOWEST TONE','OPEN THE LAST CHANNEL','REFLECT THE EMPTY CODE','READ THE CHAMBER LOG','TURN THE SILENT WHEEL','JOIN THE FINAL PAIRS','LOOK INTO THE VOID','MARK THE CHAMBER SAFE'],
   shifts:[14,'VOID',0,0,0,0,9,0,0,0],
   story:'Silence itself is archived here, wrapped in challenge ciphers at the deepest point below.',lore:'The Null Chamber proves that even silence can carry meaning when a codebreaker listens.'}
 ];
 const out=[];
 for(const pack of packs){
  for(let i=0;i<10;i++) out.push([pack.typeOrder[i],pack.titles[i],pack.answers[i],pack.shifts[i],pack.story,pack.lore]);
 }
 return out;
}
missionData.push(...buildExtraMissionPack());
const stationLabels=['Radio','Signal Post','Decoder','Bridge','Relay','Switch','Gate','Marker','Terminal','Beacon'];
const missions=missionData.map((d,i)=>({id:i+1,region:Math.floor(i/10),index:i%10,type:d[0],title:d[1],answer:d[2],shift:d[3],story:d[4],lore:d[5],station:stationLabels[i%10]}));
function encodeMission(m){const p=m.answer;switch(m.type){case 'caesar':return cipher(p,m.shift);case 'atbash':return atbash(p);case 'a1z26':return encodeNum(p);case 'reverse':return reverse(p);case 'pigpen':return '[PIGPEN GLYPHS]';case 'hex':return encodeHex(p);case 'vigenere':return vigenere(p,m.shift);case 'morse':return encodeMorse(p);case 'binary':return encodeBinary(p);case 'rail':return encodeRail(p);case 'layer':return cipher(reverse(p),m.shift)}return p}
const milestones=[
 {n:1,name:'FIRST CONTACT',description:'Solve your first transmission.'},
 {n:10,name:'FOREST CODEBREAKER',description:'Secure the Forgotten Signal.'},
 {n:20,name:'RUNE READER',description:'Finish Symbol Canyon.'},
 {n:30,name:'CLOCKWORK TECHNICIAN',description:'Restore the Clockwork Archives.'},
 {n:40,name:'MAZE EXPLORER',description:'Clear the Echo Labyrinth.'},
 {n:50,name:'CRYSTAL ANALYST',description:'Finish the Crystal Catacombs.'},
 {n:60,name:'CORE GUARDIAN',description:'Clear the deep Cipher Core.'},
 {n:70,name:'TOWER CLIMBER',description:'Repair the Relay Tower.'},
 {n:80,name:'STORM WATCHER',description:'Secure the Storm Observatory.'},
 {n:90,name:'SPIRE RESTORER',description:'Restore the Signal Spire.'},
 {n:100,name:'SUNRUNNER',description:'Reach the Sunline Canopy.'},
 {n:110,name:'CLOUDWALKER',description:'Clear the Cloudglass Aerie.'},
 {n:120,name:'SKY CROWN KEEPER',description:'Secure the Celestial Apex.'},
 {n:130,name:'LANTERN WARDEN',description:'Decode the Lantern Warrens.'},
 {n:140,name:'OBSIDIAN ARCHIVIST',description:'Unlock the Obsidian Vaults.'},
 {n:150,name:'MASTER CODEBREAKER',description:'Complete all 150 transmissions.'}
];
function loadSave(){let s={solved:[],hints:{},drafts:{},points:0,agent:'AGENT NOVA',region:0,floor:0,sound:true,started:false,seenEnd:false,training:'guided',startMode:'',unlockedByCode:0,accessRegions:[],missionJump:{}};try{let v=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(v&&typeof v==='object'){
 s={...s,...v};s.solved=Array.isArray(v.solved)?[...new Set(v.solved.filter(n=>Number.isInteger(n)&&n>=1&&n<=missions.length))]:[];
 s.hints=typeof v.hints==='object'&&v.hints&&!Array.isArray(v.hints)?v.hints:{};
 s.drafts=typeof v.drafts==='object'&&v.drafts&&!Array.isArray(v.drafts)?Object.fromEntries(Object.entries(v.drafts).filter(([k])=>/^\d{1,3}$/.test(k)).map(([k,val])=>[k,String(val).slice(0,100)])) : {};
 s.region=Math.min(regions.length-1,Math.max(0,Number(v.region)||0));s.floor=Math.min(2,Math.max(0,Number(v.floor)||0));
 s.points=Math.max(0,Number(v.points)||0);s.agent=String(v.agent||'AGENT NOVA').slice(0,20);s.training=(v.training==='veteran'?'veteran':'guided');s.startMode=String(v.startMode||'');s.unlockedByCode=Math.max(0,Number(v.unlockedByCode)||0);s.accessRegions=Array.isArray(v.accessRegions)?v.accessRegions.filter(r=>Number.isInteger(r)&&r>=0&&r<regions.length):[];s.missionJump=(v.missionJump&&typeof v.missionJump==='object'&&!Array.isArray(v.missionJump))?v.missionJump:{};
 if(v.seenEnd&&s.solved.length<missions.length)s.seenEnd=false;
 }}catch(e){}return s}
let save=loadSave();
function resetProgress(){const sound=save.sound;try{localStorage.removeItem(SAVE_KEY)}catch(e){}save=loadSave();save.sound=sound;hero.x=160;hero.y=299;hero.floor=0;camera=0;keys={};persist();updateUI()}
let tutorialShift=0;
const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){toast('Local saving is unavailable in this browser.') }};
const currentRegionMissions=r=>missions.filter(m=>m.region===r);
const solvedInRegion=r=>currentRegionMissions(r).filter(m=>save.solved.includes(m.id)).length;
const isUnlockedRegion=r=>r>=0&&r<regions.length&&(r===0||save.accessRegions.includes(r)||requiredRegion[r]>=0&&solvedInRegion(requiredRegion[r])===10);
const activeInRegion=r=>currentRegionMissions(r).find(m=>m.index>=Math.max(0,Math.min(9,Number(save.missionJump[r]||0)))&&!save.solved.includes(m.id))||null;
const currentMission=()=>activeInRegion(save.region)||missions.find(m=>isUnlockedRegion(m.region)&&!save.solved.includes(m.id))||null;
const isInteractable=m=>isUnlockedRegion(m.region)&&(save.solved.includes(m.id)||activeInRegion(m.region)?.id===m.id);
const badgeCount=()=>milestones.filter(m=>save.solved.length>=m.n).length;
let hero={x:160,y:299,walk:0,floor:save.floor},keys={},camera=0,nearby=null,lastFrame=0,particles=0,modalStack=[],toastTimeout=0,travelAnimation=null,lastVerticalInput=-10000;
let toolkit={type:'',input:'',shift:0,key:'',stage:'shift',output:'',missionId:null};
const canvas=$('#world'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const hash=n=>{let x=Math.sin(n*127.1+39.44)*43758.5453;return x-Math.floor(x)};
const locs=Array.from({length:10},(_,i)=>stationX(i));
const activeGlobalIndex=()=>currentMission()?.id||missions.length;
function activeIndexForRegion(){return activeInRegion(save.region)?.index??9}
function setFloor(f,teleport=false){hero.floor=Math.max(0,Math.min(2,f));save.floor=hero.floor;if(teleport)hero.x=160;persist();updateUI()}
function goToRegion(r,teleport=true,targetFloor=0){if(!isUnlockedRegion(r)){toast('Decode the prior region to unlock this passage.');sfx('bad');return}
 save.region=r;hero.floor=Math.max(0,Math.min(2,targetFloor));save.floor=hero.floor;if(teleport){hero.x=165;hero.y=299;camera=0}
 keys={};persist();updateUI();if(modalStack.length)closeAllModals();toast('Entered '+regions[r].name+' · DECK '+(hero.floor+1))}
function trackObjective(){const mission=activeInRegion(save.region);
 if(!mission){openNav('map');return}
 const floor=floorOf(mission.index);hero.floor=floor;save.floor=floor;hero.x=Math.max(45,locs[mission.index]-48);
 camera=Math.max(0,Math.min(WORLD_WIDTH-W,hero.x-W*.39));persist();updateUI();toast('Transmission located on DECK '+(floor+1)+' · Press E to decode.');canvas.focus({preventScroll:true})}
function availableExits(r=save.region){return {up:regionAbove[r],down:regionBelow[r]}}
function attemptVertical(direction){if(blocked()||travelAnimation)return;
 const now=performance.now();if(now-lastVerticalInput<340)return;lastVerticalInput=now;
 if(hero.x<120 && direction>0){
   if(hero.floor<2){startTravel({floor:hero.floor+1,portal:'left'});sfx('tap');return}
   const target=regionAbove[save.region];
   if(target==null){toast('This is the highest tower level.');return}
   if(!isUnlockedRegion(target)){toast('Upper passage sealed · Clear the prior region first.');sfx('bad');return}
   startTravel({region:target,floor:0,portal:'left'});sfx('tap');return;
 }
 if(hero.x>710 && direction<0){
   if(hero.floor>0){startTravel({floor:hero.floor-1,portal:'right'});sfx('tap');return}
   const target=regionBelow[save.region];
   if(target==null){toast('You have reached the deepest vault.');return}
   if(!isUnlockedRegion(target)){toast('Lower passage sealed · Clear the prior region first.');sfx('bad');return}
   startTravel({region:target,floor:2,portal:'right'});sfx('tap');return;
 }
 if(hero.x<120) toast('LEFT STAIRS CLIMB. Press W or ↑ here to go up.');
 else if(hero.x>710) toast('RIGHT STAIRS DESCEND. Press S or ↓ here to go down.');
 else toast('Move to the LEFT stairwell to climb up, or the RIGHT stairwell to go down.');}
function startTravel(target){travelAnimation={fromRegion:save.region,fromFloor:hero.floor,toRegion:target.region??save.region,toFloor:target.floor??hero.floor,start:performance.now(),duration:860,direction:(target.region!=null?regions[target.region].elevation-regions[save.region].elevation:target.floor-hero.floor)>0?1:-1,portal:target.portal||((target.region??save.region)!==save.region?'left':'center')};keys={}}
function finishTravel(){if(!travelAnimation)return;const a=travelAnimation;travelAnimation=null;const changedRegion=a.toRegion!==save.region;if(changedRegion){save.region=a.toRegion;hero.x=a.portal==='right'?750:100;camera=0}else hero.x=a.portal==='right'?750:100;hero.floor=a.toFloor;save.floor=a.toFloor;persist();updateUI();toast(regions[save.region].name+' · DECK '+(hero.floor+1));}
function updateUI(){const r=save.region,reg=regions[r],regional=currentRegionMissions(r),open=activeInRegion(r),display=open||regional.at(-1),count=solvedInRegion(r),done=save.solved.length===missions.length;
 $('#regionName').textContent=reg.label;$('#chapterMeta').textContent=`${reg.elevation>0?'TOWER +'+reg.elevation:reg.elevation<0?'DEPTH '+reg.elevation:'SURFACE 0'} · DECK ${hero.floor+1}/3`;
 $('#topStatus').textContent=done?'ALL CHANNELS RESTORED':'ENCRYPTED CHANNEL ACTIVE';$('#agentName').textContent=save.agent;
 $('#agentRank').textContent=save.solved.length>=120?'MASTER FIELD OPERATIVE':save.solved.length>=60?'SENIOR CODEBREAKER':save.solved.length>=15?'FIELD OPERATIVE':'ROOKIE CODEBREAKER';
 $('#statSolved').textContent=pad(save.solved.length);$('#statScore').textContent=pad(save.points,4);$('#statBadges').textContent=pad(badgeCount());
 $('#missionCount').textContent=`${pad(save.solved.length)} / ${missions.length}`;$('#missionId').textContent=open?`MISSION ${pad(display.id)} · INCOMING`:`REGION ${pad(r+1)} · COMPLETE`;
 $('#missionTitle').textContent=open?display.title:'Region Secured';$('#missionSummary').textContent=open?display.story:reg.finish;
 $('#missionType').textContent=open?(cipherTypeHint(display)||'UNKNOWN ENCRYPTION'):'ALL SIGNALS DECODED';
 $('#btnMission').querySelector('span').textContent=open?'DECODE TRANSMISSION':done?'MISSION COMPLETE':'WORLD MAP · NEXT REGION';
 $('#regionFraction').textContent=`${count}/10`;$('#progressRegion').textContent=reg.name;$('#progressPct').textContent=`${count*10}%`;$('#progressFill').style.width=`${count*10}%`;
 $('#regionMessage').textContent=count===10?'This region is secure. Explore another level on the world map.':'Find the active station. Each region has three explorable decks.';
 $('#screenObjective').textContent=open?`DECK ${floorOf(open.index)+1} · ${display.title} · STATION ${display.index+1}`:'All transmissions secured · visit world map';
 $('#screenWeather').textContent=`${reg.path==='above'?'TOWER':reg.path==='below'?'LABYRINTH':'JUNCTION'} // ${reg.elevation>=0?'+':''}${reg.elevation}`;
 $('#btnSound').textContent=save.sound?'♪':'♪̸';
 $('#nodeList').innerHTML=regional.map(m=>`<button type="button" class="${save.solved.includes(m.id)?'solved':(open?.id===m.id?'current':'')}" data-action="mission-node" data-id="${m.id}" title="${esc(m.title)} · Deck ${floorOf(m.index)+1}" aria-label="Mission ${m.id}: ${esc(m.title)} · Deck ${floorOf(m.index)+1}">${save.solved.includes(m.id)?'✓':m.index+1}</button>`).join('');
 $('#storyTicker').textContent=done?'The Guild network has been restored, above and below.':save.solved.length?missions.filter(m=>save.solved.includes(m.id)).at(-1).lore:'Every secret has a pattern. Every pattern has a key.';
 $('#floorIndicator').textContent=`DECK ${hero.floor+1} / 3`;$('#exitPrompt').textContent=reg.path==='above'?'LEFT STAIRS UP · RIGHT STAIRS DOWN':'LEFT STAIRS UP · RIGHT STAIRS DOWN';
}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),3200)}
function audioTone(freq=440,duration=.085,shape='square'){if(!save.sound)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const ac=audioTone.ac||(audioTone.ac=new Audio());if(ac.state==='suspended')ac.resume();const osc=ac.createOscillator(),gain=ac.createGain();osc.type=shape;osc.frequency.setValueAtTime(freq,ac.currentTime);gain.gain.setValueAtTime(.035,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(ac.currentTime+duration)}catch(e){}}
function sfx(type){if(type==='good'){audioTone(523,.10);setTimeout(()=>audioTone(659,.09),100);setTimeout(()=>audioTone(784,.18),190)}else if(type==='bad')audioTone(190,.12,'sawtooth');else audioTone(610,.06)}
function modOpen(view,opts={}){modalStack.push({view,opts});renderModal()}
function modalReplace(view,opts={}){modalStack=[{view,opts}];renderModal()}
function modalBack(){if(!modalStack.length)return;modalStack.pop();renderModal();if(!modalStack.length)canvas.focus({preventScroll:true})}
function closeAllModals(){modalStack=[];renderModal();canvas.focus({preventScroll:true})}
function modalFrame(title,kicker,body,footer='',size=''){return `<div class="modal-backdrop" data-backdrop><section class="modal-window ${size}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-heading"><div><div class="modal-kicker">${esc(kicker)}</div><h2>${esc(title)}</h2></div><button class="close-btn" data-action="close" aria-label="Close dialog">×</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</section></div>`}
const btn=(name,act,cl='plain-btn',attrs='')=>`<button type="button" class="${cl}" data-action="${act}" ${attrs}>${name}</button>`;
function renderModal(){const root=$('#modalRoot');if(!modalStack.length){root.innerHTML='';return}const {view,opts}=modalStack.at(-1);let html='';if(view==='intro')html=renderIntro();if(view==='returning')html=renderReturning();if(view==='tutorial')html=renderTutorial();if(view==='code')html=renderCodeEntry();if(view==='mission')html=renderMission(opts.id);if(view==='toolkit')html=renderToolkit();if(view==='map')html=renderMap();if(view==='guide')html=renderGuide();if(view==='journal')html=renderJournal();if(view==='settings')html=renderSettings();if(view==='chapter')html=renderChapter(opts.region);if(view==='ending')html=renderEnding();root.innerHTML=html;const auto=$('[autofocus]',root);if(auto)auto.focus({preventScroll:true});else $('.close-btn',root)?.focus({preventScroll:true})}
function cipherTypeHint(m){
 if(save.training==='veteran') return '';
 if(m.id<=12) return 'LIKELY CIPHER: '+cipherInfo[m.type].name;
 const family={caesar:'SUBSTITUTION CIPHER',atbash:'SUBSTITUTION CIPHER',a1z26:'NUMBER CIPHER',reverse:'TEXT MANIPULATION',pigpen:'SYMBOL CIPHER',morse:'SIGNAL CIPHER',binary:'COMPUTER CODE',rail:'TRANSPOSITION CIPHER',layer:'MULTI-STAGE CIPHER',hex:'COMPUTER CODE',vigenere:'KEYWORD CIPHER'};
 if(m.id<=30) return 'CIPHER FAMILY HINT: '+family[m.type];
 return '';
}
function renderReturning(){const has=save.started||save.solved.length>0;
 return modalFrame('Returning Codebreaker','CIPHER GUILD // FIELD ACCESS',`<div class="story-tag">★ WELCOME BACK</div><p class="story-copy">${has?`Your local mission record has ${save.solved.length} completed transmissions. Continue where you left off or use a mission code.`:'No saved mission record exists in this browser yet. You can start a new game or use a classroom code.'}</p><p class="small-caption">Returning mode keeps existing progress. Veteran mode removes automatic cipher-type hints, but optional hints remain available.</p>`,(has?btn('CONTINUE MY SAVE →','resume','action-btn')+btn('VETERAN MODE','veteran','plain-btn'):'')+btn('ENTER MISSION CODE','code','plain-btn')+btn('START FRESH','new-agent','plain-btn'),'narrow')}
function renderTutorial(){const decoded=cipher('KHOOR',-tutorialShift);return modalFrame('Rookie Agent Tutorial','FIELD TRAINING // PRACTICE ONLY',`<div class="story-tag">★ LEARN THE BASICS</div><div class="intro-grid"><div class="intro-step"><b>01</b><strong>EXPLORE</strong><p>A/D or arrow keys move left and right. Climb at the LEFT stairs with W/↑; descend at the RIGHT stairs with S/↓.</p></div><div class="intro-step"><b>02</b><strong>DECODE</strong><p>Copy encrypted text into the toolkit, choose the decoder and set your own controls. The final answer is never entered for you.</p></div><div class="intro-step"><b>03</b><strong>GROW</strong><p>The first missions identify likely ciphers. By Mission 31, you choose the technique yourself. Optional hints remain available.</p></div></div><div class="signal-box" style="margin-top:17px"><div class="signal-top"><span>● PRACTICE TRANSMISSION</span><span>CAESAR WHEEL</span></div><div class="cipher-text">KHOOR</div></div><p class="small-caption">Try different backward shifts. What English word appears?</p><div style="display:flex;gap:10px;align-items:center;justify-content:center;margin:12px"><button type="button" data-action="tutorial-minus" class="plain-btn">−</button><strong>SHIFT <span id="tutorialShiftNumber">${tutorialShift}</span></strong><button type="button" data-action="tutorial-plus" class="plain-btn">+</button></div><div class="complete-banner" style="text-align:center"><strong id="tutorialOutput">${decoded}</strong><p id="tutorialFeedback">${tutorialShift===3?'Correct! You found the hidden word.':'Use the shift controls until the result is a recognizable word.'}</p></div>`,btn('SKIP TRAINING','tutorial-finish','plain-btn')+btn('ENTER THE FIELD →','tutorial-finish','action-btn'),'wide')}
function renderCodeEntry(){return modalFrame('Enter Mission Code','FIELD ACCESS // CLASSROOM JUMP CODES',`<p class="story-copy">Returning players can jump to a region or mission. Classroom examples: <strong>CQ-R07</strong> for Region 7 or <strong>CQ-M085</strong> for Mission 85.</p><label class="input-label" for="jumpCodeInput">MISSION OR REGION CODE</label><input id="jumpCodeInput" class="answer-input" type="text" maxlength="20" placeholder="CQ-R07 or CQ-M085" autofocus><p class="small-caption">A few fake codes also exist, but the Guild may tease anyone trying to skip the work.</p>`,btn('BACK','close','plain-btn')+btn('USE CODE →','use-code','action-btn'),'narrow')}
function applyJumpCode(code){const c=String(code||'').toUpperCase().trim().replace(/\s+/g,'');
 const jokes={FREEA:'CODE DENIED // NICE TRY, AGENT.',ANSWERSPLEASE:'THE GUILD SAYS: DO THE WORK YOURSELF.',SHAREWITHFRIENDS:'TRANSMISSION CORRUPTED // CODEBREAKERS EARN THEIR OWN SIGNALS.',IDDQD:'WRONG GAME, AGENT.'};
 if(jokes[c])return {ok:false,msg:jokes[c]};
 let match=c.match(/^CQ-?M(\d{1,3})$/);if(match){
  const mission=Number(match[1]);if(mission<1||mission>missions.length)return {ok:false,msg:'Mission code outside the available range (001–150).'};
  const r=Math.floor((mission-1)/10),n=(mission-1)%10;
  if(!save.accessRegions.includes(r))save.accessRegions.push(r);
  save.missionJump[r]=n;save.started=true;save.startMode='code';persist();goToRegion(r,true,floorOf(n));
  hero.x=Math.max(45,locs[n]-45);camera=Math.max(0,Math.min(WORLD_WIDTH-W,hero.x-230));
  return {ok:true,msg:'Mission '+pad(mission)+' unlocked. Earlier missions are not marked completed.'};
 }
 match=c.match(/^CQ-?R(\d{1,2})$/);if(match){
  const region=Number(match[1]);if(region<1||region>regions.length)return {ok:false,msg:'Region code outside the available range (01–15).'};
  const r=region-1;if(!save.accessRegions.includes(r))save.accessRegions.push(r);
  save.started=true;save.startMode='code';persist();goToRegion(r,true,0);
  return {ok:true,msg:'Region '+pad(region)+' unlocked. Previous missions remain available.'};
 }
 return {ok:false,msg:'Code not recognized. Ask your teacher for a valid classroom code.'};
}

function renderIntro(){const hasSave=save.started||save.solved.length>0;return modalFrame('Cipher Quest: Codebreakers','CIPHER GUILD // TOP SECRET',`<div class="story-tag">★ NEW OR RETURNING?</div><h1 class="hero-headline">CHOOSE YOUR<br><span class="mint-text">MISSION PATH.</span></h1><p class="story-copy">Start in Radio Woods, then climb the tower through brighter sky regions or descend through darker lantern-lit chambers. The game now includes <strong>150 missions across 15 regions</strong>.</p><div class="intro-grid"><div class="intro-step"><b>NEW</b><strong>GUIDED START</strong><p>Begins a fresh save with tutorial support and cipher-type hints that fade as missions get harder.</p></div><div class="intro-step"><b>RETURN</b><strong>RESUME OR VETERAN</strong><p>Continue your save with lighter training wheels and full access to later routes.</p></div><div class="intro-step"><b>CODE</b><strong>JUMP IN</strong><p>Enter classroom mission codes to jump to a region or checkpoint for make-up work.</p></div></div><p class="tagline">150 MISSIONS · 15 REGIONS · LEFT STAIRS UP · RIGHT STAIRS DOWN</p>`,btn('FIELD GUIDE','guide','plain-btn')+btn('NEW AGENT →','new-agent','action-btn')+btn('RETURNING AGENT','returning','plain-btn')+btn('ENTER CODE','code','plain-btn'),'wide')} 
function pigpenGlyph(letter){const k=letter.charCodeAt(0)-65;if(k<0||k>25)return '';let p='',dot=false;if(k<18){const i=k%9,row=Math.floor(i/3),col=i%3;dot=k>=9;let lines=[];if(row>0)lines.push('M 7 6 H 25');if(row<2)lines.push('M 7 26 H 25');if(col>0)lines.push('M 7 6 V 26');if(col<2)lines.push('M 25 6 V 26');p=lines.map(c=>`<path d="${c}"/>`).join('');}else{const i=(k-18)%4;dot=k>=22;const edge=[['M 5 4 L 16 16 L 27 4'],['M 28 5 L 16 16 L 28 27'],['M 5 28 L 16 16 L 27 28'],['M 4 5 L 16 16 L 4 27']];p=`<path d="${edge[i][0]}"/>`;}return `<svg viewBox="0 0 32 32" aria-label="${letter}" role="img" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#f4d08d" stroke-width="2.6" stroke-linejoin="miter" stroke-linecap="square">${p}</g>${dot?'<circle cx="16" cy="16" r="2.1" fill="#5ae5c4"/>':''}</svg>`}
function pigpenEncoded(t){return `<div class="glyph-encoded" role="img" aria-label="Pigpen cipher message; use glyph chart to decode">${[...t].map(c=>c===' '?'<span class="glyph-space"></span>':`<span class="glyph-unit">${pigpenGlyph(c)}</span>`).join('')}</div>`}
function hintText(m,index){const base={caesar:[`Use the Caesar wheel. The message was shifted forward by ${m.shift}; decode by moving backward.`,`Try that shift in the workbench and compare the output with the mission.`,`The first word begins with ${m.answer.split(' ')[0].slice(0,2)} and has ${m.answer.split(' ')[0].length} letters.`],atbash:['Reverse the alphabet: A ↔ Z, B ↔ Y, and so on.','Atbash replaces each encrypted letter with its partner on the mirrored alphabet. Try a few letters or an entire message in the mirror decoder.',`The first word has ${m.answer.split(' ')[0].length} letters and starts with ${m.answer[0]}.`],a1z26:['Numbers match alphabet positions: A=1, B=2, … Z=26.','Separate number groups at hyphens; each slash separates words.',`The first decoded word starts with ${m.answer[0]}.`],reverse:['Try reading the entire encoded text from the last character to the first.','Copy the encrypted message into the Reverse Reader or start reading from the end.',`The first word is ${m.answer.split(' ')[0].length} letters long.`],pigpen:['Open the Pigpen tab. Every glyph matches one letter in its chart.','Grid fragments A–I have no dot; J–R have dots. X fragments S–V have no dot; W–Z have dots.',`The decoded message starts with the letter ${m.answer[0]}.`],morse:['Dots are short signals and dashes are long signals. Each space separates a letter.','Separate each Morse character with a space and words with a slash in the receiver.',`The decoded first word begins with ${m.answer[0]}.`],binary:['Each group of 8 zeroes and ones is an ASCII character. 01000001 is A.','Keep the 8-bit binary groups separated by spaces; 00100000 means a space.',`The first word starts with ${m.answer[0]}.`],rail:['The encoded text was written on two alternating rows.','Alternate letters between two rails, then compare your reconstruction.',`The decoded message begins with ${m.answer.split(' ')[0].slice(0,2)}.`],layer:[`The message was first reversed and then shifted forward ${m.shift}. Undo the Caesar shift first.`,`Undo the shift first, and then run a second reversal stage when ready.`,`The original message starts with ${m.answer[0]}.`],hex:['Two hexadecimal digits represent one ASCII character. Letters A–F are valid hex digits.','Keep two-digit hexadecimal groups separated by spaces; 20 represents a space.',`The answer begins with ${m.answer[0]}.`],vigenere:[`Use the repeating keyword ${m.shift} in the Keyword wheel.`,`For each letter, subtract the alphabetical shift of the matching key letter. Spaces do not advance the key.`,`The first word starts with ${m.answer[0]}.`]};return (base[m.type]||[])[index]||'Check the handbook.'}
function renderMission(id){
 const m=missions[id-1];if(!m)return '';
 if(!isInteractable(m))return modalFrame('Transmission Locked','ACCESS DENIED',`<p class="story-copy">Complete the current assignment before accessing this transmission.</p>`,btn('BACK','close'),'narrow');
 // Never transfer ciphertext, secret shift, or keyword to the equipment.
 // Keep independently entered work when returning from the guide or an optional hint.
 if(toolkit.missionId!==id){toolkit={type:'',input:'',shift:0,key:'',stage:'shift',output:'',missionId:id}}
 const solved=save.solved.includes(id),hintN=Math.min(3,Number(save.hints[id]||0)),enc=encodeMission(m);
 const ciphertext=m.type==='pigpen'?pigpenEncoded(m.answer):esc(enc);
 const submit=solved?btn('CLOSE REPLAY','close','action-btn'):btn('SUBMIT DECODE →','submit','action-btn',`data-id="${id}"`);
 return modalFrame(m.title,`TRANSMISSION ${pad(id)} // ${regions[m.region].subtitle.toUpperCase()}`,
 `<div class="challenge-strip"><b>MISSION + DECODER · SIDE BY SIDE</b><span>Choose a cipher tool, enter the text, set the controls, and run your test.</span></div>
 <div class="puzzle-layout workbench-layout">
  <section class="mission-left" aria-label="Encrypted transmission and answer">
   <p class="puzzle-story">${esc(m.story)}</p>
   ${cipherTypeHint(m)?`<div class=\"support-label\" style=\"margin-bottom:8px\">${esc(cipherTypeHint(m))}</div>`:''}<div class="signal-box"><div class="signal-top"><span>● INTERCEPTED TRANSMISSION</span><span>${cipherTypeHint(m)||'UNKNOWN CIPHER'}</span></div><div class="cipher-text">${ciphertext}</div></div>
   ${solved?`<div class="complete-banner"><strong>✓ TRANSMISSION DECODED</strong><p>${esc(m.lore)}</p><span class="accent-text">ANSWER: ${esc(m.answer)}</span></div>`:
   `<label for="decodeAnswer" class="input-label">YOUR FINAL DECODED MESSAGE</label><input class="answer-input" id="decodeAnswer" type="text" maxlength="100" value="${esc(save.drafts[id]||'')}" placeholder="TYPE YOUR OWN ANSWER · AUTOSAVED" autocomplete="off" spellcheck="false" autofocus><div id="answerFeedback" class="error-msg" aria-live="polite"></div>`}
   <div class="mission-intel"><div class="support-label">✦ FIELD INTELLIGENCE</div><p>${esc(cipherTypeHint(m)?(m.id<=12?cipherInfo[m.type].guide:'Inspect symbol grouping and letter patterns to identify the specific technique.'): 'Determine the encoding method using the message structure, your field guide, and the optional hints.')}</p><div class="support-label">HINTS / ${hintN} OF 3</div><ul class="hint-list">${Array.from({length:hintN},(_,i)=>`<li>HINT ${i+1}: ${esc(hintText(m,i))}</li>`).join('')}</ul>${!solved&&hintN<3?btn('REVEAL NEXT HINT (−15 PTS)','hint','outline-btn hint-btn',`data-id="${id}"`):''}<p class="small-caption">The decoder is free; optional hints cost 15 points each. Nothing fills in your answer for you.</p></div>
  </section>
  <aside class="side-decoder" aria-label="Interactive cipher toolkit">${renderWorkbench()}</aside>
 </div>`, btn('FIELD GUIDE','guide','plain-btn')+submit,'wide mission-wide')
}
function renderWorkbench(){
 const types=['caesar','atbash','a1z26','reverse','pigpen','morse','binary','hex','vigenere','rail','layer'];
 const type=toolkit.type, info=cipherInfo[type]||{guide:'Read the mission clues and choose the decoding instrument that matches the encrypted symbols. No instrument, text, shift, or keyword is selected for you.'};
 const prompts={caesar:'Encrypted letters to shift',atbash:'Letters to mirror',a1z26:'Numbers separated with hyphens; words with /',reverse:'Text to reverse',pigpen:'',morse:'Morse groups separated by spaces; words with /',binary:'8-bit groups separated by spaces',hex:'2-digit hex groups separated by spaces',vigenere:'Encrypted letters to decode',rail:'Letters from both rails, without spaces',layer:'Encrypted message (shift then reverse)'};
 const note=type==='pigpen'?'Use the symbol chart; the graphical symbols cannot be pasted into a text decoder.':type==='layer'?'First select your Caesar shift; after testing, choose the second stage to reverse it.':'Enter any length of ciphertext manually. Run your trial when ready.';
 return `<div class="workbench-heading"><span class="status-pill">◉ MANUAL EQUIPMENT</span><strong>YOUR CODEBREAKER LAB</strong></div>
 <label for="toolType" class="input-label">CHOOSE A DECODING INSTRUMENT</label>
 <select id="toolType" class="tool-select"><option value="" ${!type?'selected':''}>SELECT A DECODER…</option>${types.map(t=>`<option value="${t}" ${t===type?'selected':''}>${esc(cipherInfo[t].label)}</option>`).join('')}</select>
 <p class="workbench-guide">${esc(info.guide)}</p>
 ${!type?`<p class="workbench-empty">Select a decoder to begin. Study the intercepted message and its clues to decide which decoding technique fits.</p>`:type==='pigpen'?`<div class="support-label">PIGPEN SYMBOL CHART</div><div class="glyph-ref">${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(c=>`<div class="reference-cell"><b>${c}</b>${pigpenGlyph(c)}</div>`).join('')}</div><p class="small-caption">Match each symbol in the mission transmission. Type the corresponding message into your answer field.</p>`:
 `<label for="toolInput" class="input-label">YOUR CIPHERTEXT INPUT</label>
 <textarea class="tool-input" id="toolInput" rows="3" maxlength="600" placeholder="TYPE OR PASTE THE ENCRYPTED TEXT HERE" spellcheck="false" autocomplete="off">${esc(toolkit.input)}</textarea>
 ${type==='caesar'||type==='layer'?`<label class="input-label">SET YOUR OWN SHIFT</label><div class="shift-controls"><button type="button" data-action="shift-down" aria-label="Decrease shift">−</button><div class="shift-value" id="shiftReadout">SHIFT ${toolkit.shift}</div><button type="button" data-action="shift-up" aria-label="Increase shift">+</button></div>`:''}
 ${type==='vigenere'?`<label class="input-label" for="keywordInput">KEYWORD — TYPE IT YOURSELF</label><input id="keywordInput" class="answer-input" value="${esc(toolkit.key)}" maxlength="24" placeholder="NO KEYWORD GIVEN" autocomplete="off">`:''}
 ${type==='layer'?`<label class="input-label" for="stageSelect">YOUR NEXT DECODING STEP</label><select id="stageSelect" class="tool-select"><option value="shift" ${toolkit.stage==='shift'?'selected':''}>Stage 1 — shift back only</option><option value="both" ${toolkit.stage==='both'?'selected':''}>Stage 2 — shift back, then reverse</option></select>`:''}
 <button type="button" class="action-btn workbench-run" data-action="tool-test">▶ TEST MY DECODER SETTINGS</button>
 <div class="support-label">TEST OUTPUT — NEVER AUTO-SUBMITTED</div>
 <div id="toolOutput" class="tool-readout" role="status" aria-live="polite">${esc(toolkit.output||'No test run yet. Enter ciphertext and test your choices.')}</div>`}
 <p class="small-caption">${esc(note)} The mission answer stays separate. Your decoder does not know the correct shift or keyword.</p>
 ${type==='morse'?`<details class="reference-details"><summary>MORSE REFERENCE CHART</summary><div class="reference-grid">${Object.entries(MORSE_TABLE).map(([k,v])=>`<div class="reference-cell"><b>${k}</b><span>${v}</span></div>`).join('')}</div></details>`:''}
 ${type==='a1z26'?`<details class="reference-details"><summary>ALPHABET NUMBER CHART</summary><div class="reference-grid">${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((c,i)=>`<div class="reference-cell"><b>${c}</b><span>${i+1}</span></div>`).join('')}</div></details>`:''}`;
}
function renderToolkit(){
 return modalFrame('Cipher Toolkit','FIELD EQUIPMENT // NO AUTOMATIC ANSWERS',`<div class="challenge-strip"><b>YOU CONTROL THE TOOL</b><span>Type any message. Choose the decoder and its settings. The output appears only when you run your test.</span></div><div class="standalone-workbench">${renderWorkbench()}</div>`,btn('BACK TO FIELD','close','plain-btn')+btn('FIELD GUIDE','guide','action-btn'),'wide')
}
function toolResult(){
 const {type,input,shift,key,stage}=toolkit;
 const raw=String(input||'').trim().toUpperCase();
 if(type==='pigpen')return 'Use the graphical Pigpen chart to decode each symbol.';
 if(!raw)return 'Enter the encrypted message first. Nothing has been filled in automatically.';
 if(type==='caesar')return `SHIFT ${shift} — YOUR TRIAL:\n${cipher(raw,-shift)}`;
 if(type==='atbash')return `MIRROR ALPHABET — YOUR TRIAL:\n${atbash(raw)}`;
 if(type==='reverse')return `REVERSED TEXT — YOUR TRIAL:\n${reverse(raw)}`;
 if(type==='layer'){const shifted=cipher(raw,-shift);return stage==='both'?`SHIFT ${shift}, THEN REVERSE — YOUR TRIAL:\n${reverse(shifted)}`:`SHIFT ${shift} ONLY — FIRST STAGE:\n${shifted}\nChoose Stage 2 when you are ready to reverse it.`}
 if(type==='vigenere')return /^[A-Z]+$/.test(key)?`KEYWORD ${key.toUpperCase()} — YOUR TRIAL:\n${vigenere(raw,key,true)}`:'Enter your own alphabetic keyword before testing.';
 if(type==='a1z26')return /^[\d\s\-/]+$/.test(raw)?`NUMBER CIPHER — YOUR TRIAL:\n${decodeNum(raw)}`:'Use numbers 1–26, with hyphens between letters and / between words.';
 if(type==='morse'){const groups=raw.split(/\s*\/\s*/).flatMap(w=>w.split(/\s+/)).filter(Boolean);return groups.every(g=>MORSE_REVERSE[g])?`MORSE CODE — YOUR TRIAL:\n${decodeMorse(raw)}`:'Use valid dot/dash letter groups, spaces between letters, and / between words.'}
 if(type==='binary'){const groups=raw.split(/\s+/).filter(Boolean);return groups.every(g=>/^[01]{8}$/.test(g))?`BINARY ASCII — YOUR TRIAL:\n${decodeBinary(raw)}`:'Use groups of exactly 8 binary digits, separated by spaces.'}
 if(type==='hex'){const groups=raw.split(/\s+/).filter(Boolean);return groups.every(g=>/^[0-9A-F]{2}$/.test(g))?`HEXADECIMAL ASCII — YOUR TRIAL:\n${decodeHex(raw)}`:'Use 2-digit hexadecimal groups separated by spaces.'}
 if(type==='rail')return /^[A-Z]+$/.test(raw.replace(/\s/g,''))?`TWO-RAIL FENCE — YOUR TRIAL (SPACING OMITTED):\n${decodeRail(raw)}`:'Use the encoded letters from both rails, without punctuation.';
 return 'Choose a decoder and run your trial.';
}
function renderMap(){const card=i=>{const r=regions[i],unlocked=isUnlockedRegion(i),count=solvedInRegion(i),active=i===save.region;return `<button type="button" class="route-node ${active?'active-region':''} ${unlocked?'':'route-locked'}" data-action="region" data-region="${i}" ${unlocked?'':'disabled'}><span class="route-symbol">${r.symbol}</span><span class="route-copy"><small>${r.elevation===0?'SURFACE':r.elevation>0?'ALTITUDE +'+r.elevation:'DEPTH '+r.elevation} · ${count}/10 SIGNALS</small><strong>${esc(r.name)}</strong><em>${esc(r.tag)}</em></span><span class="route-status">${count===10?'✓':unlocked?'↗':'🔒'}</span></button>`};
 return modalFrame('Vertical World Map','CIPHER GUILD // TOWER & LABYRINTH',`<p class="story-copy">The Forgotten Signal is your crossroads. <strong>Move to the left stairs and press W / ↑ to climb up.</strong> <strong>Move to the right stairs and press S / ↓ to descend.</strong> At the top of a region you can continue into the next tower zone; at the bottom you can go deeper into the labyrinth.</p><div class="vertical-world-map"><div class="route-column route-up"><div class="route-heading">↑ TOWER ASCENT</div>${[11,10,9,8,7,6].map(card).join('')}</div><div class="route-junction"><span>✦ CROSSROADS</span>${card(0)}</div><div class="route-column route-down"><div class="route-heading">↓ LABYRINTH DESCENT</div>${[1,2,3,4,5,12,13,14].map(card).join('')}</div></div>`,btn('RETURN TO FIELD','close'),'wide')}
function renderGuide(){return modalFrame('Codebreaker’s Handbook','TRAINING MANUAL // ALL CLEARANCE LEVELS',`<p class="story-copy">A field reference for every encryption method in Cipher Quest. The first chapters introduce familiar substitution patterns; the Archives add signals, binary representation, and multi-step decoding.</p>${Object.entries(cipherInfo).map(([id,info])=>`<div class="guide-entry"><h3>${esc(info.name)}</h3><p>${esc(info.guide)}</p><div class="guide-example">${esc(info.example)}</div>${id==='pigpen'?`<div class="glyph-ref" style="margin-top:12px">${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(c=>`<div class="reference-cell"><b>${c}</b>${pigpenGlyph(c)}</div>`).join('')}</div>`:''}</div>`).join('')}`,btn('BACK','close')+btn('OPEN TOOLKIT','toolkit','action-btn'),'wide')}
function renderJournal(){const solved=missions.filter(m=>save.solved.includes(m.id));return modalFrame('Case Journal','CLASSIFIED RECORD // AUTOMATICALLY UPDATED',`<p class="story-copy">Your mission record is saved locally. ${solved.length?`You have recovered ${solved.length} transmissions so far.`:'Your first transmission is still waiting to be decoded.'}</p><div class="support-label" style="margin-bottom:13px">ACHIEVEMENTS</div><div class="badge-row">${milestones.map(b=>`<div class="badge-item ${save.solved.length>=b.n?'':'locked'}"><strong>${save.solved.length>=b.n?'★':'◇'} ${esc(b.name)}</strong><small>${esc(b.description)}</small></div>`).join('')}</div><div class="support-label" style="margin:19px 0 12px">RECOVERED INTELLIGENCE</div>${solved.length?solved.map(m=>`<div class="journal-entry"><b>✓ ${pad(m.id)} · ${esc(m.title)}</b><p>“${esc(m.answer)}” — ${esc(m.lore)}</p></div>`).join(''):'<p class="muted-text">No solved transmissions yet. Return to the forest radio to begin.</p>'}`,btn('RETURN TO FIELD','close'),'wide')}
function renderSettings(){return modalFrame('Settings & Progress','AGENT OPTIONS // LOCAL STORAGE',`<label class="input-label" for="agentCallsign">AGENT CALLSIGN (NOT YOUR REAL NAME)</label><input id="agentCallsign" class="answer-input" type="text" maxlength="20" value="${esc(save.agent)}" placeholder="AGENT NOVA"><p class="small-caption">Use a nickname. This app does not need student names or accounts.</p><div class="settings-row"><div><strong>RETRO SOUND EFFECTS</strong><p>Short, optional synthesized feedback sounds.</p></div><input type="checkbox" id="soundToggle" ${save.sound?'checked':''} aria-label="Sound effects"></div><div class="settings-row"><div><strong>RESET GAME PROGRESS</strong><p>Deletes the save for this browser only. This cannot be undone.</p></div><button data-action="reset-confirm" class="danger-btn">RESET</button></div><div class="settings-row"><div><strong>OFFLINE & PRIVACY</strong><p>Progress is stored in this browser's localStorage. No accounts, tracking, or network connections.</p></div><span class="mint-text">LOCAL</span></div>`,btn('SAVE SETTINGS','save-settings','action-btn'),'narrow')}
function renderChapter(r){const exits=[];if(r===0)exits.push(6,1);else if(regionAbove[r]!=null&&isUnlockedRegion(regionAbove[r])&&activeInRegion(regionAbove[r]))exits.push(regionAbove[r]);
 if(regionBelow[r]!=null&&isUnlockedRegion(regionBelow[r])&&activeInRegion(regionBelow[r]))exits.push(regionBelow[r]);
 return modalFrame('Region Secured!',`REGION ${pad(r+1)} // ALL 10 TRANSMISSIONS RECOVERED`,`<div class="story-tag">★ FIELD INTELLIGENCE RECOVERED</div><h1 class="hero-headline">${esc(regions[r].name.toUpperCase())}<br><span class="mint-text">COMPLETE.</span></h1><p class="story-copy">${esc(regions[r].finish)}</p><p class="story-copy">${save.solved.length===missions.length?'Both branches are secure. The final network is restored.':'Continue exploring the tower or labyrinth, or revisit any recovered transmission.'}</p>`,btn('WORLD MAP','map','plain-btn')+(save.solved.length===missions.length?btn('FINAL REPORT →','ending','action-btn'):btn('RETURN TO FIELD','close','action-btn')),'narrow')}
function renderEnding(){return modalFrame('Operation Complete','CIPHER GUILD // FINAL DEBRIEF',`<div class="story-tag">★ MASTER CODEBREAKER UNLOCKED</div><h1 class="hero-headline">THE GUILD<br><span class="mint-text">IS CONNECTED.</span></h1><p class="story-copy">One hundred fifty transmissions. Fifteen regions. Two paths. One truth: <strong>ECHO was protecting the Cipher Guild all along.</strong> The underground Cipher Core and the deeper chambers contained the forged orders; the tower route preserved the authentic warning. Your codebreaking restored every level of the network.</p><div class="complete-banner"><b>★ ALL 150 MISSIONS COMPLETE</b><p>You may revisit every floor, replay puzzles, and continue using your cipher tools.</p></div><div class="reward-stat">${pad(save.points,4)} <span class="small-caption">TOTAL POINTS</span></div>`,btn('OPEN CASE JOURNAL','journal')+btn('RETURN TO WORLD →','close','action-btn'),'narrow')}
function startMission(id){const m=missions[id-1];if(!m){toast('Transmission unavailable.');return}if(!isInteractable(m)){toast('That station is locked. Decode the earlier transmission first.');sfx('bad');return}sfx('tap');modOpen('mission',{id})}
function solveMission(id){const m=missions[id-1],input=$('#decodeAnswer'),feedback=$('#answerFeedback');if(!m||!input||!feedback)return;const guess=normalize(input.value);save.drafts[id]=input.value.slice(0,100);persist();if(!guess){feedback.textContent='Enter your decoded message before submitting.';return}if(guess!==normalize(m.answer)){feedback.textContent='Not quite. Recheck the code, adjust your decoder, or reveal a hint.';sfx('bad');input.select();return}if(save.solved.includes(id)){toast('Transmission already decoded.');return}if(activeInRegion(m.region)?.id!==id){toast('Complete this region’s transmissions in order.');return}const hints=Math.min(3,Number(save.hints[id]||0)),awarded=Math.max(55,100-15*hints);save.points+=awarded;save.solved.push(id);delete save.drafts[id];persist();updateUI();sfx('good');toast(`SIGNAL DECODED · +${awarded} POINTS`);if(m.index===9){if(save.solved.length===missions.length){save.seenEnd=true;persist();modalReplace('ending')}else modalReplace('chapter',{region:m.region});return}modalReplace('success',{id,awarded});renderModal()}
function renderSuccess(id,awarded){const m=missions[id-1];return modalFrame('Signal Decoded!',`MISSION ${pad(id)} // TRANSMISSION RECOVERED`,`<div class="complete-banner"><b>✓ CORRECT DECODE: ${esc(m.answer)}</b><p>${esc(m.lore)}</p></div><div class="reward-stat">+${awarded} <span class="small-caption">POINTS EARNED</span></div><p class="story-copy" style="margin-top:14px">The next station has unlocked. Follow the glowing waypoint or use <strong>Track Signal</strong> to jump there.</p>`,btn('RETURN TO FIELD','close','plain-btn')+btn('TRACK NEXT SIGNAL →','success-next','action-btn'),'narrow')}
const _renderModal=renderModal;
renderModal=function(){const root=$('#modalRoot');if(!modalStack.length){root.innerHTML='';return}const {view,opts}=modalStack.at(-1);if(view==='success'){root.innerHTML=renderSuccess(opts.id,opts.awarded);$('.close-btn',root)?.focus({preventScroll:true});return}_renderModal()};
function openToolkit(id){
 if(id){const m=missions[id-1];if(m&&toolkit.missionId!==id)toolkit={type:'',input:'',shift:0,key:'',stage:'shift',output:'',missionId:id};return}
 toolkit={type:'',input:'',shift:0,key:'',stage:'shift',output:'',missionId:null};modOpen('toolkit');
}
function openNav(view){modOpen(view)}
function actionClick(e){const el=e.target.closest('[data-action]');if(!el)return;const act=el.dataset.action;const id=Number(el.dataset.id||0);switch(act){case 'close':modalBack();break;case 'new-agent':if((save.solved.length>0||Object.keys(save.missionJump).length>0||save.points>0)&&!window.confirm('Start a new game? This will replace your saved progress on this browser.'))break;resetProgress();save.started=true;save.training='guided';save.startMode='new';persist();tutorialShift=0;modalReplace('tutorial');break;case 'returning':modOpen('returning');break;case 'resume':save.started=true;save.startMode='returning';persist();closeAllModals();toast('Returning to your saved mission.');break;case 'veteran':save.started=true;save.training='veteran';save.startMode='returning';persist();closeAllModals();toast('Veteran mode enabled.');break;case 'tutorial-minus':tutorialShift=(tutorialShift+25)%26;renderModal();break;case 'tutorial-plus':tutorialShift=(tutorialShift+1)%26;renderModal();break;case 'tutorial-finish':save.started=true;persist();closeAllModals();toast('Training complete. Find the first glowing station.');break;case 'code':modOpen('code');break;case 'use-code':{const res=applyJumpCode($('#jumpCodeInput')?.value||'');toast(res.msg);if(res.ok){closeAllModals();canvas.focus({preventScroll:true})}else sfx('bad');break;}case 'start':save.started=true;persist();closeAllModals();canvas.focus({preventScroll:true});toast('Mission accepted. Follow the golden beacon.');break;case 'mission-node':{const m=missions[id-1];if(m&&m.region===save.region&&isInteractable(m)){hero.floor=floorOf(m.index);save.floor=hero.floor;hero.x=Math.max(45,locs[m.index]-45);camera=Math.max(0,Math.min(WORLD_WIDTH-W,hero.x-230));persist();updateUI()}startMission(id);break}case 'submit':solveMission(id);break;case 'hint':{const n=Math.min(3,Number(save.hints[id]||0));if(n>=3)return;save.hints[id]=n+1;persist();renderModal();$('#decodeAnswer')?.focus({preventScroll:true});sfx('tap');break}case 'toolkit-from-mission':openToolkit(id);renderModal();break;case 'toolkit':openToolkit();break;case 'guide':openNav('guide');break;case 'journal':openNav('journal');break;case 'map':openNav('map');break;case 'settings':openNav('settings');break;case 'tool-tab':toolkit.type=el.dataset.tool;toolkit.output='';renderModal();break;case 'tool-test':toolkit.output=toolResult();refreshTool();sfx('tap');break;case 'shift-down':toolkit.shift=(toolkit.shift+25)%26;toolkit.output='';refreshTool();sfx('tap');break;case 'shift-up':toolkit.shift=(toolkit.shift+1)%26;toolkit.output='';refreshTool();sfx('tap');break;case 'region':goToRegion(Number(el.dataset.region));break;case 'chapter-next':goToRegion(Number(el.dataset.region));break;case 'ending':modalReplace('ending');break;case 'success-next':closeAllModals();const cm=currentMission();if(cm&&cm.region!==save.region){goToRegion(cm.region)}else trackObjective();break;case 'save-settings':{const v=$('#agentCallsign')?.value||'';save.agent=v.toUpperCase().replace(/[^A-Z0-9 -]/g,'').trim().slice(0,20)||'AGENT NOVA';save.sound=Boolean($('#soundToggle')?.checked);persist();updateUI();modalBack();toast('Settings saved locally.');break}case 'reset-confirm':if(window.confirm('Reset all 150 mission saves, points, hints, codes, and agent progress on this browser?')){const sound=save.sound;try{localStorage.removeItem(SAVE_KEY)}catch(e){}save=loadSave();save.sound=sound;hero.x=160;hero.y=299;hero.floor=0;camera=0;persist();updateUI();modalReplace('intro');toast('New game ready.')}break}}
function refreshTool(){const el=$('#toolOutput');if(el)el.textContent=toolkit.output||'Settings changed. Run a test to see the result.';const sh=$('#shiftReadout');if(sh)sh.textContent=`SHIFT ${toolkit.shift}`}
document.addEventListener('click',actionClick);
document.addEventListener('input',e=>{
 if(e.target.id==='toolInput'){toolkit.input=e.target.value.slice(0,600);toolkit.output='';refreshTool()}
 if(e.target.id==='keywordInput'){toolkit.key=e.target.value.toUpperCase().replace(/[^A-Z]/g,'');toolkit.output='';refreshTool()}
 if(e.target.id==='decodeAnswer'){const top=modalStack.at(-1);const id=top?.opts?.id;if(top?.view==='mission'&&id&&!save.solved.includes(id)){save.drafts[id]=e.target.value.slice(0,100);persist()}}
});
document.addEventListener('change',e=>{
 if(e.target.id==='toolType'){toolkit.type=e.target.value;toolkit.output='';renderModal()}
 if(e.target.id==='stageSelect'){toolkit.stage=e.target.value==='both'?'both':'shift';toolkit.output='';refreshTool()}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'&&e.target.id==='toolInput'&&!e.shiftKey)){e.preventDefault();toolkit.output=toolResult();refreshTool()}if(e.key==='Enter'&&e.target.id==='decodeAnswer'){e.preventDefault();const m=modalStack.at(-1);if(m?.view==='mission')solveMission(m.opts.id)}});
document.addEventListener('click',e=>{if(e.target.matches('[data-backdrop]'))modalBack()});
$('#btnGuide').addEventListener('click',()=>openNav('guide'));
$('#btnHandbook').addEventListener('click',()=>openNav('guide'));
$('#btnSettings').addEventListener('click',()=>openNav('settings'));
$('#btnMap').addEventListener('click',()=>openNav('map'));
$('#btnRegions').addEventListener('click',()=>openNav('map'));
$('#btnJournal').addEventListener('click',()=>openNav('journal'));
$('#btnToolkit').addEventListener('click',()=>openToolkit());
$('#brandHome').addEventListener('click',()=>openNav('intro'));
$('#btnMission').addEventListener('click',()=>{const m=activeInRegion(save.region);if(m)startMission(m.id);else if(save.solved.length===missions.length)openNav('ending');else openNav('map')});
$('#btnJump').addEventListener('click',trackObjective);
$('#btnSound').addEventListener('click',()=>{save.sound=!save.sound;persist();updateUI();if(save.sound)sfx('tap');toast(save.sound?'Audio on':'Audio off')});
$('#btnFullscreen').addEventListener('click',()=>{const el=$('#viewport');if(document.fullscreenElement){document.exitFullscreen?.()}else{el.requestFullscreen?.().catch(()=>toast('Full-screen mode is unavailable.'))}});
const blocked=()=>modalStack.length>0;
function interact(){if(blocked())return;const m=nearby;if(m&&isInteractable(m)){startMission(m.id);return}if(m&&!isInteractable(m)){toast('Locked. Complete the earlier station.');sfx('bad');return}const open=currentRegionMissions(save.region).find(m=>!save.solved.includes(m.id));if(!open){if(save.solved.length===missions.length)openNav('ending');else openNav('map');return}toast('Approach a glowing station, or select TRACK SIGNAL to find it.');sfx('bad')}
const movementKeys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S'];
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(blocked()){e.preventDefault();modalBack()}return}const typing=e.target.matches('input,textarea,[contenteditable]');if(typing||blocked())return;if(movementKeys.includes(e.key)){if(['arrowup','w','arrowdown','s'].includes(e.key.toLowerCase())){e.preventDefault();if(!e.repeat)attemptVertical(['arrowup','w'].includes(e.key.toLowerCase())?1:-1)}else{keys[e.key.toLowerCase()]=true;if(e.key.startsWith('Arrow'))e.preventDefault()}}if(e.key.toLowerCase()==='e'){e.preventDefault();if(!e.repeat)interact()}});
window.addEventListener('keyup',e=>{delete keys[e.key.toLowerCase()]});
window.addEventListener('blur',()=>keys={});
for(const [id,key] of [['moveLeft','arrowleft'],['moveRight','arrowright']]){const b=$('#'+id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[key]=true});for(const eventName of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(eventName,()=>delete keys[key])}
$('#moveAction').addEventListener('click',interact);$('#moveUp').addEventListener('click',()=>attemptVertical(1));$('#moveDown').addEventListener('click',()=>attemptVertical(-1));
canvas.addEventListener('pointerdown',e=>{if(blocked())return;const bounds=canvas.getBoundingClientRect(),x=(e.clientX-bounds.left)/bounds.width*W+camera;let nearest=stationsOnFloor(save.region,hero.floor).map(m=>({m,d:Math.abs(x-locs[m.index])})).sort((a,b)=>a.d-b.d)[0];if(nearest&&nearest.d<43){hero.x=Math.max(45,locs[nearest.m.index]-42);if(isInteractable(nearest.m))startMission(nearest.m.id);else toast('Transmission locked. Decode earlier stations first.')}else canvas.focus({preventScroll:true})});

// Pixel-art renderer. All artwork is drawn in code; no network image dependencies.
const fill=(x,y,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
function poly(pts,color){ctx.fillStyle=color;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
function line(x1,y1,x2,y2,c,w=2){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function pixelSky(r,t){const palettes=[['#132238','#172a43','#223850','#314a60','#4b5869','#856875'],['#382b4d','#5f405c','#975666','#bf796c','#dda17a','#e1b888'],['#101a2b','#192b3e','#223449','#29445a','#365266','#3e6071'],['#101c2b','#18283a','#263548','#344557','#415366','#4b5668'],['#17162e','#292246','#3a3159','#453765','#3a4969','#2f5264'],['#19152c','#321e3d','#442d49','#3e3d5b','#2a405e','#213c52'],['#182337','#263c55','#385574','#4f6b86','#68839a','#7896a7'],['#0c1b37','#16335b','#24486d','#345b79','#537b8e','#6c98a6'],['#0b1a3e','#142e55','#22466f','#2e6482','#3e7d91','#628b9c'],['#213c3e','#33615d','#5f8a71','#8eb77a','#d8db94','#fbf8d2'],['#14344f','#2b577f','#5f8eb3','#8fc0da','#dff3ff','#ffffff'],['#0d2642','#24456e','#4d77a1','#83b1cf','#d4f3ff','#fff7de'],['#150f23','#2a1b35','#3d2346','#55315c','#6e5a77','#8f8e9b'],['#100e1f','#1f1b31','#302740','#443757','#5c5071','#8d7b98'],['#090e19','#111a29','#17293d','#22455d','#316f88','#4ec6d3']];const colors=palettes[r]||palettes[0];colors.forEach((c,i)=>fill(0,i*48,640,49,c));
 for(let i=0;i<65;i++){const x=hash(i*23+8)*640,y=hash(i*32+19)*210,tw=hash(i*6+1)>.75?2:1;if(r!==1||i%4===0)fill(x,y,tw,tw,hash(i*19)>.65?'#b0bfd0':'#607c9d')}
 if(r===0){ellipse(512,65,29,29,'#d2c49a');ellipse(519,60,25,25,'#e8d5a6');fill(0,205,640,10,'#3d5069')}
 else if(r===1){ellipse(485,88,46,46,'#f4bc83');fill(0,204,640,18,'#c78a71')}
 else if(r===2){ellipse(495,84,36,36,'#426780');ellipse(491,82,30,30,'#537c8b')}
 else if(r>=6){ellipse(510,71,24,24,r===8?'#dcf6d0':'#d2dfe1');for(let i=0;i<13;i++){const x=((i*92-t*(r===8?18:6))%900+900)%900;ellipse(x,151+(i%5)*13,48,9,'#809cb35c')}}
 else{for(let i=0;i<7;i++)ellipse((i*101+28-camera*.10)%700,195+(i%3)*27,44,22,r===4?'#554879':'#34485a')}
}
function drawMountainLayer(offset,r){const shift=camera*.14;ctx.save();ctx.translate(-shift,0);for(let x=-150;x<1500;x+=200){const c=r===1?'#87565e':r===0?'#2b4558':'#263b4c';poly([[x,223],[x+90,123+(hash(x)*35)],[x+200,223]],c);if(r===0)poly([[x+78,162],[x+90,126+(hash(x)*35)],[x+113,160]],'#8c9496')}ctx.restore()}
function spruce(x,y,size,c){const cx=x-camera*.36;fill(cx-3,y-19*size,6,30*size,'#333f3b');for(let k=0;k<3;k++)poly([[cx,y-(72-k*17)*size],[cx-(24-k*3)*size,y-(24+k*8)*size],[cx+(24-k*3)*size,y-(24+k*8)*size]],c)}
function farForest(t){for(let i=0;i<38;i++){const x=i*42+hash(i)*16-80;spruce(x,272,.62+hash(i*13)*.5,i%3?'#223e45':'#2c4b50')}fill(0,282,640,20,'#2c4742')}
function drawDesertFar(){ctx.save();ctx.translate(-camera*.3,0);for(let i=0;i<10;i++){const x=-200+i*180;fill(x,190,110,80,'#905d61');fill(x+14,169,85,23,'#a56863');fill(x+31,153,53,20,'#b67a6c');fill(x+42,141,32,14,'#b67a6c');fill(x+8,210,95,7,'#7d5363')}ctx.restore();poly([[0,267],[145,242],[300,270],[470,253],[640,273],[640,304],[0,304]],'#b78674')}
function drawArchiveFar(t){fill(0,205,640,90,'#253649');for(let i=0;i<18;i++){const x=i*43-(camera*.16%43);fill(x,105,28,183,'#34465b');fill(x+4,110,20,149,'#18283b');fill(x+9,117,10,123,'#26485a');fill(x+12,120,4,112,'#4b9188');fill(x,188,33,7,'#45556a')}for(let i=0;i<8;i++){let x=i*95+20-camera*.12,y=62+(i%2)*45;drawGear(x,y,15,t*(i%2?1:-1),false)}fill(0,245,640,40,'#304358')}
function drawGear(x,y,rad,angle,solid=true){ctx.save();ctx.translate(x,y);ctx.rotate(angle);const color=solid?'#a88a63':'#4c6276';for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);fill(-4,-rad-5,8,10,color)}ellipse(0,0,rad,rad,color);ellipse(0,0,rad*.55,rad*.55,solid?'#5d5c5b':'#26394c');ellipse(0,0,rad*.23,rad*.23,'#1b2537');ctx.restore()}
function forestProps(t){for(let i=0;i<20;i++){const x=i*87-32;const sx=x-camera;const size=.7+hash(i*5)*.6;if(sx<-95||sx>W+90)continue;fill(sx-3,219,7,78,'#39493f');for(let k=0;k<4;k++)poly([[sx,172-k*13],[sx-24*size,227-k*9],[sx+25*size,227-k*9]],i%3?'#2d5755':'#386a5b');fill(sx+5,274,3,5,'#64916e');if(i%4===0){fill(sx+35,289,5,5,'#e1a165');fill(sx+32,287,11,3,'#f1bb75')}}}
function desertProps(t){for(let i=0;i<14;i++){const x=i*130-45,sx=x-camera;if(sx<-40||sx>W+50)continue;fill(sx,265,9,32,'#456f6b');fill(sx-7,276,7,8,'#456f6b');fill(sx-7,267,4,11,'#456f6b');fill(sx+9,271,7,8,'#456f6b');fill(sx+12,263,4,12,'#456f6b');fill(sx-4,293,17,4,'#6e7168');if(i%3===1){fill(sx+30,274,19,20,'#94675c');fill(sx+31,268,17,7,'#be8870')}}}
function archiveProps(t){for(let i=0;i<15;i++){const x=i*115+37,sx=x-camera;if(sx<-90||sx>W+90)continue;fill(sx-7,219,34,77,'#3b4b58');fill(sx-2,219,23,57,'#263b4d');fill(sx+3,234,12,23,'#1d2d3a');if(i%3===0)drawGear(sx+12,261,11,t*(i%2?-1:1),true);else {fill(sx+5,244,8,5,'#e3b66e');fill(sx+8,249,2,29,'#79949b')}}}
function drawGround(r){const ground=['#324a43','#9b7765','#303c4d','#35455a','#333653','#332e4c','#475e70','#3b586d','#335c6d','#4a6f69','#66839c','#7da2b8','#41354e','#2e303f','#1c2634'][r],rim=['#5b7b64','#dcc094','#738294','#667d8e','#6e75a1','#b08b9d','#9db4bc','#9bbbc5','#aad8c5','#dce7b5','#cde9f4','#fff4cb','#d8a869','#8f97b0','#7dd5da'][r];fill(0,296,640,64,ground);fill(0,293,640,5,rim);fill(0,302,640,2,['#436057','#b58f70','#3b5966','#4b667c','#595d82','#7c5c78','#73909b','#6b9aa5','#68aba1','#adc07a','#d9f2ff','#fff8c8','#7e5d63','#6f7594','#4ec9cf'][r]);for(let i=0;i<120;i++){let sx=(i*47+hash(i*71)*30-camera*.83)%720;if(sx<0)sx+=720;const y=304+(hash(i*23)*45)|0;fill(sx,y,2+(i%3)*2,1+(i%2),r===1?'#b49172':r===2?'#46576b':r>=12?'#8093b3':r>=9?'#8ab2c1':r>=3?'#718ba2':'#537067')}if(r===0)for(let i=0;i<45;i++){const x=(i*61+hash(i)*33-camera)%W;fill((x+W)%W,290,2,4,i%2?'#75a073':'#91a879')}if(r===2)for(let i=0;i<7;i++){const sx=((i*120-camera)%750+750)%750;fill(sx,313,65,3,'#516276');fill(sx+15,303,7,34,'#495d71')}}
function drawTower(t){if(save.region!==0)return;const x=1513-camera;if(x>W+80||x<-100)return;fill(x-14,143,28,150,'#415463');fill(x-21,277,42,16,'#303c44');fill(x-23,211,45,8,'#5f686b');fill(x-16,165,30,11,'#89908d');fill(x-2,104,4,40,'#9ea59a');for(let i=0;i<4;i++){fill(x-17,183+i*23,34,3,'#647578');line(x-14,185+i*23,x+12,208+i*23,'#4b666a',2)}ellipse(x,106,5+Math.sin(t*3)*2,5+Math.sin(t*3)*2,'#6fe4c8')}
function drawStation(m,t){const x=locs[m.index]-camera;if(x<-60||x>W+60)return;const solved=save.solved.includes(m.id),active=currentMission()?.id===m.id,accessible=isInteractable(m);const highlight=active?'#f1d28e':solved?'#6de6c7':'#64778d';const y=286;ellipse(x,y+7,30,6,'#192731');if(active){const glow=Math.sin(t*3)*3;ellipse(x,y-28,30+glow,35+glow,'#edc98320');fill(x-27,y-65,54,2,'#8c7c59')}if(m.index%5===0){fill(x-20,y-42,40,44,'#405161');fill(x-15,y-36,30,23,'#142d3a');fill(x-11,y-32,22,15,active?'#2e8b82':'#366a76');fill(x-7,y-28,14,2,'#a8e7d4');fill(x-12,y-6,24,5,'#786e59');fill(x-25,y,50,5,'#768188')}else if(m.index%5===1){fill(x-15,y-61,30,63,'#58616c');fill(x-9,y-56,18,32,'#1a3541');fill(x-5,y-52,10,17,'#51968c');fill(x-2,y-79,4,18,'#7e8990');fill(x-12,y-3,24,7,'#8d897b')}else if(m.index%5===2){fill(x-20,y-36,40,37,'#6c6565');fill(x-16,y-32,32,23,'#223b48');fill(x-11,y-27,22,15,'#3a8d87');fill(x-3,y-25,7,4,'#c9d4a4');fill(x-25,y,50,6,'#82756a')}else if(m.index%5===3){fill(x-10,y-59,20,61,'#555a63');fill(x-18,y-59,36,10,'#968878');fill(x-12,y-33,24,14,'#283946');fill(x-5,y-29,10,6,'#71bcb3');fill(x-18,y,36,5,'#867e76')}else {fill(x-17,y-21,34,21,'#6d6257');fill(x-13,y-38,26,21,'#977d62');fill(x-8,y-33,16,11,'#f0bf74');fill(x-18,y,37,5,'#ac8c6b')}
 fill(x-22,y+5,44,4,'#29384c');if(!accessible&&!solved){fill(x-7,y-15,14,11,'#253246');fill(x-4,y-19,8,9,'#253246')}if(solved){fill(x-9,y-60,18,17,'#285c57');fill(x-5,y-54,11,3,'#8ff2c7');fill(x-6,y-55,4,6,'#8ff2c7')}else if(active){const bob=Math.sin(t*4)*3;poly([[x-8,y-85+bob],[x+8,y-85+bob],[x,y-75+bob]],'#ffcb7c');fill(x-2,y-105+bob,4,14,'#ffd28b')}fill(x-20,y+13,40,15,'#101b2a');fill(x-19,y+14,38,13,accessible?'#314857':'#202b3b');ctx.font='bold 9px monospace';ctx.fillStyle=highlight;ctx.textAlign='center';ctx.fillText(pad(m.index+1)+' '+(solved?'OK':active?'!':'—'),x,y+24)
}
function drawHero(t){const x=Math.round(hero.x-camera),y=Math.round(hero.y),moving=!!(keys.arrowleft||keys.arrowright||keys.a||keys.d||keys.w||keys.s||keys.arrowup||keys.arrowdown),bounce=moving?Math.sin(hero.walk)*2|0:0;ellipse(x,y+3,15,4,'#16262d');let foot=y-1+bounce;fill(x-13,foot-7,10,7,'#151e31');fill(x+3,foot-7,10,7,'#151e31');fill(x-9,foot-19,8,14,'#53677a');fill(x+1,foot-19,8,14,'#53677a');fill(x-11,foot-35,22,19,'#43556b');fill(x-17,foot-33,6,14,'#efbf94');fill(x+11,foot-33,6,14,'#efbf94');fill(x-9,foot-37,18,5,'#e8b87d');fill(x-8,foot-55,16,18,'#edbc91');fill(x-10,foot-61,20,8,'#263c56');fill(x-12,foot-57,25,5,'#f0c574');fill(x-9,foot-65,18,5,'#36506b');fill(x-5,foot-48,3,4,'#253343');fill(x+4,foot-48,3,4,'#253343');fill(x-2,foot-42,5,2,'#a97662');fill(x+7,foot-29,5,8,'#61dcca');fill(x+9,foot-27,2,4,'#d9ffff')}
function drawForeground(r,t){if(r===0){for(let i=0;i<27;i++){let x=((i*91-camera*1.15)%850+850)%850;fill(x,299+hash(i)*41,3,4,hash(i)>.5?'#6e9870':'#406d55')}}else if(r===1){for(let i=0;i<15;i++){let x=((i*73-camera*.9)%800+800)%800;fill(x,314+hash(i)*25,7,3,'#d0a07b')}}else{for(let i=0;i<8;i++){let x=((i*117-camera)%750+750)%750;fill(x,315,2,26,'#98a080')}}}
function drawParticles(t){const r=save.region;for(let i=0;i<26;i++){const x=(hash(i*13+1)*720+Math.sin(t*(.3+hash(i))*1.4+i)*15)%640,y=65+hash(i*33+5)*230+(Math.sin(t*.7+i)*10);const glow=(Math.sin(t*3+i*5)+1)*.5;fill(x,y,r===1?2:2,r===1?2:2,r===0?(glow>.6?'#b6cf83':'#5c9987'):r===1?'#f2d19c':'#62a8a3')}}
function drawRadar(t){const m=activeInRegion(save.region);if(!m||floorOf(m.index)!==hero.floor)return;const sx=locs[m.index]-camera;if(sx>W-30){fill(W-19,181,3,22,'#ffd18b');poly([[W-25,193],[W-17,186],[W-17,200]],'#ffd18b')}else if(sx<30){fill(19,181,3,22,'#ffd18b');poly([[25,193],[17,186],[17,200]],'#ffd18b')}}
function drawNewRegion(r,t){const f=hero.floor;ctx.save();
 if(r===3){ // Echo Labyrinth: carved arches, torches, endless passages
  fill(0,172,640,128,'#1a293b');for(let i=0;i<10;i++){const x=((i*112-camera*.23)%840+840)%840-100;
   fill(x,98,14,195,'#405366');fill(x+67,98,14,195,'#405366');fill(x,96,81,10,'#51647a');poly([[x-10,96],[x+40,48],[x+91,96]],'#354a60');
   fill(x+31,129,23,145,'#101b2e');ellipse(x+12,176,3+Math.sin(t*4+i)*2,5,'#eaba68');ellipse(x+67,176,4,7,'#f1b96a');}
  ctx.font='22px monospace';ctx.fillStyle='#516684';ctx.fillText('◈',290,107);
 }else if(r===4){ // Crytalline cavern
  fill(0,194,640,106,'#293252');for(let i=0;i<19;i++){const x=((i*77-camera*.25)%800+800)%800-80,h=28+hash(i*31)*90;
   poly([[x-25,291],[x,289-h],[x+12,294]],i%3===0?'#71b5bd':i%3===1?'#7059a4':'#4f95a5');
   poly([[x,289-h],[x+9,272],[x+12,294]],i%2?'#97dbe1':'#9b8ac9');}
  ellipse(489,114,51,42,'#6952a8');ellipse(491,110,27,29,'#9c90cf');
 }else if(r===5){ // Deep cipher core
  fill(0,113,640,185,'#203345');for(let i=0;i<12;i++){let x=(i*80-camera*.3+840)%840-60;fill(x,115,14,171,'#485e69');fill(x+2,126,10,133,'#2c3f59');fill(x+24,144,34,8,'#4e465f');fill(x+41,153,2,103,'#d58b76')}
  ellipse(460,152,73+Math.sin(t*2)*2,73,'#554468');ellipse(460,152,51,51,'#2f5978');ellipse(460,152,22,22,'#92bb9b');line(460,87,460,216,'#b1a1b6',2);
 }else if(r===6){ // Relay tower exterior
  fill(0,222,640,72,'#263c53');for(let i=0;i<13;i++){const x=((i*99-camera*.23)%840+840)%840-50;fill(x,98,10,198,'#415a74');fill(x-9,122,28,8,'#718495');fill(x-25,216,65,5,'#7b8e99');line(x,106,x+48,290,'#425873',3);line(x+48,106,x,290,'#425873',3);}
  fill(451,62,6,182,'#9cb8c8');fill(435,99,35,5,'#96a5a7');fill(433,151,40,5,'#96a5a7');ellipse(455,54,6,6,'#91f6dd');
 }else if(r===7){ // Telescope observation dome
  fill(0,199,640,99,'#244057');for(let i=0;i<9;i++){const x=((i*112-camera*.24)%900+900)%900-50;fill(x,161,9,139,'#607d94');fill(x+10,161,42,5,'#8aadb6')}
  ellipse(423,175,126,86,'#3b5875');ellipse(423,175,107,67,'#253b56');fill(405,91,42,45,'#8bb2bd');line(414,98,455,51,'#b6ced0',11);ellipse(455,54,13,15,'#d0d5bd');
 }else if(r===8){ // storm spire high antenna
  fill(0,219,640,78,'#2c526a');for(let i=0;i<9;i++){const x=((i*148-camera*.14)%900+900)%900-60;fill(x,121,7,176,'#4e8296');line(x,127,x+65,297,'#6d8c9e',2);line(x+65,127,x,297,'#6d8c9e',2);fill(x-26,168,61,7,'#9aabb0')}
  fill(449,30,11,229,'#d1d9bd');fill(429,86,52,6,'#8baaba');fill(441,10,24,17,'#c5e9cc');ellipse(454,8,8+Math.sin(t*5)*2,8+Math.sin(t*5)*2,'#b8fae5');
  if(Math.sin(t*1.4)>0.93)poly([[227,26],[212,81],[242,90],[221,160]],'#d9f8ef');
 }else if(r===9){ // Sunline Canopy
  fill(0,206,640,92,'#456d69');for(let i=0;i<10;i++){const x=((i*110-camera*.2)%900+900)%900-70;fill(x,165,13,131,'#6d8a5a');fill(x-18,152,48,14,'#a8c66c');fill(x-28,144,67,12,'#d5de8c');}
  fill(458,88,38,121,'#7f9688');fill(432,124,96,8,'#dde5a4');ellipse(461,58,18+Math.sin(t*2)*3,18+Math.sin(t*2)*3,'#fff1ab');
 }else if(r===10){ // Cloudglass Aerie
  fill(0,208,640,90,'#6ba0bf');for(let i=0;i<8;i++){const x=((i*134-camera*.18)%980+980)%980-90;poly([[x,210],[x+28,147],[x+61,210]],'#c9f3ff');poly([[x+18,180],[x+46,112],[x+80,180]],'#9fd6ee');}
  fill(436,92,110,7,'#dff8ff');fill(451,99,11,125,'#95bdd1');fill(520,99,11,125,'#95bdd1');
 }else if(r===11){ // Celestial Apex
  fill(0,215,640,82,'#4b87a2');for(let i=0;i<9;i++){const x=((i*140-camera*.15)%980+980)%980-60;fill(x,132,8,166,'#9dbfd0');line(x,138,x+55,298,'#d7edf6',2);line(x+55,138,x,298,'#bdd6df',2)}
  fill(454,45,8,205,'#f9f1c8');for(let i=0;i<6;i++)fill(428+i*11,95+i*14,68-i*22,4,'#ffeeb2');ellipse(458,31,10+Math.sin(t*4),10+Math.sin(t*4),'#fff7cf');
 }else if(r===12){ // Lantern Warrens
  fill(0,184,640,114,'#2b2238');for(let i=0;i<11;i++){const x=((i*98-camera*.23)%860+860)%860-60;fill(x,118,68,176,'#493851');ellipse(x+7,171,4,6,'#ffca6d');ellipse(x+61,171,4,6,'#ffca6d');fill(x+28,129,10,140,'#25192f');}
 }else if(r===13){ // Obsidian Vaults
  fill(0,176,640,122,'#1f2433');for(let i=0;i<9;i++){const x=((i*118-camera*.2)%930+930)%930-70;fill(x,104,82,190,'#30384d');fill(x+13,118,56,8,'#5d6680');fill(x+20,146,40,112,'#171d29');}
  fill(446,101,80,8,'#8d97b8');fill(470,109,32,130,'#5e6788');
 }else if(r===14){ // Null Chamber
  fill(0,165,640,133,'#131a26');for(let i=0;i<12;i++){const x=((i*77-camera*.18)%900+900)%900-40;fill(x,92,12,203,'#22334a');if(i%2===0)ellipse(x+6,166,3,3,'#5be0e6');}
  ellipse(470,155,90,90,'#263e54');ellipse(470,155,58,58,'#0f1826');ellipse(470,155,18+Math.sin(t*2)*2,18+Math.sin(t*2)*2,'#7ef7ff');
 }
 // Every deck gets distinctive structural details and its own lighting band.
 const bands=['#f5d18f','#82c9cf','#b4a3f0'];fill(0,264,640,4,bands[f]+'88');
 ctx.restore();}
function drawStairwell(t){const x=800-camera;if(x<-115||x>W+115)return;
 fill(x-51,93,102,204,'#1a2b3c');fill(x-45,100,90,188,'#37495d');fill(x-36,107,72,166,'#142638');
 for(let j=0;j<8;j++){const sx=x-36+j*8,sy=119+j*19;fill(sx,sy,70-j*8,6,'#8293a4');fill(sx+2,sy+6,68-j*8,10,'#243f53')}line(x-41,111,x+30,278,'#c2a77d',3);line(x-29,111,x+42,278,'#8b9daf',3)
 fill(x-4,107,8,165,'#d1a36e');fill(x-24,109,4,162,'#bea980');fill(x+20,109,4,162,'#bea980');
 for(let f=0;f<3;f++){const yy=126+f*34;fill(x+36,yy,23,26,f===hero.floor?'#47b8ae':'#293e57');ctx.font='bold 11px monospace';ctx.fillStyle=f===hero.floor?'#071a29':'#a5bfd0';ctx.textAlign='center';ctx.fillText(String(f+1),x+47,yy+17)}
 ctx.font='bold 11px monospace';ctx.fillStyle='#e9d69a';ctx.textAlign='center';ctx.fillText('DESCEND',x,79);ctx.fillText('S / ↓',x,92);
 if(hero.x>710&&Math.sin(t*3)>-.45){fill(x-58,274,116,21,'#172235');ctx.fillStyle='#bce7d8';ctx.fillText(hero.floor===0&&regionBelow[save.region]!=null?'S / ↓ · GO DEEPER':'S / ↓ · GO DOWN',x,289)}
}
function drawPassage(t){const x=80-camera;if(x<-120||x>W+120)return;
 fill(x-52,91,106,204,'#1d2e43');fill(x-43,103,86,193,'#3e5268');fill(x-32,116,64,175,'#0c1c32');
 fill(x-31,119,62,3,'#8193a4');for(let i=0;i<8;i++){const sx=x-33+i*8,sy=268-i*19;fill(sx,sy,68-i*8,7,'#8395a5');fill(sx,sy+7,68-i*8,9,'#253d53')}
 line(x-41,270,x+24,117,'#dfc18d',3);line(x-30,270,x+35,117,'#b5bfc0',3);
 const up=regionAbove[save.region];
 ctx.textAlign='center';ctx.font='bold 10px monospace';if(up!=null){fill(x-37,151,74,22,'#294c5d');ctx.fillStyle=isUnlockedRegion(up)?'#c9efd7':'#82909e';ctx.fillText('↑ '+(isUnlockedRegion(up)?'CLIMB':'LOCKED'),x,166)}
 fill(x-44,85,88,3,'#8d9eaf');ctx.font='bold 10px monospace';ctx.fillStyle='#f3e4bf';ctx.fillText('ASCENT',x,110);
 if(hero.x<120&&Math.sin(t*3)>-.45){fill(x-56,319,112,17,'#172235');ctx.fillStyle='#eef0c1';ctx.fillText(hero.floor===2&&regionAbove[save.region]!=null?'W / ↑ · GO HIGHER':'W / ↑ · GO UP',x,331)}
}
function drawDeckOverlay(){fill(10,46,104,20,'#121d33cc');ctx.textAlign='left';ctx.fillStyle='#e5d5a4';ctx.font='bold 11px monospace';ctx.fillText('DECK '+(hero.floor+1)+' / 3',18,60);
 const hasAbove=regionAbove[save.region]!=null,hasBelow=regionBelow[save.region]!=null;
 if(hasAbove||hasBelow){fill(452,46,177,20,'#121d33cc');ctx.textAlign='right';ctx.fillStyle='#b8ded4';ctx.font='10px monospace';ctx.fillText(regions[save.region].elevation===0?'TOWER ↑ / LABYRINTH ↓':regions[save.region].path==='above'?'TOWER ASCENT':'LABYRINTH DESCENT',620,60)}
}
function renderScene(t,r,f,drawPlayer=true){ctx.clearRect(0,0,W,H);pixelSky(r,t);
 if(r<3){drawMountainLayer(0,r);if(r===0){farForest(t);forestProps(t)}else if(r===1){drawDesertFar();desertProps(t)}else{drawArchiveFar(t);archiveProps(t)}}else drawNewRegion(r,t);
 drawGround(r);if(r===0)drawTower(t);
 for(const m of stationsOnFloor(r,f))drawStation(m,t);
 drawPassage(t);drawStairwell(t);
 if(drawPlayer)drawHero(t);
 drawForeground(r,t);drawParticles(t);drawRadar(t);
}
function renderWorld(t){if(!travelAnimation){renderScene(t,save.region,hero.floor);return}
 // Screen slides vertically between decks or world levels as the player travels.
 const a=travelAnimation,p=Math.min(1,(performance.now()-a.start)/a.duration),ease=p*p*(3-2*p),offset=a.direction*H*ease;
 ctx.save();ctx.translate(0,offset);renderScene(t,a.fromRegion,a.fromFloor,true);ctx.restore();
 ctx.save();ctx.translate(0,offset-a.direction*H);renderScene(t,a.toRegion,a.toFloor,false);ctx.restore();
 if(p>=1)finishTravel();}
function frame(now){const dt=Math.min((now-lastFrame)/1000||.016,.06);lastFrame=now;const t=now/1000;let vx=0;
 if(!blocked()&&!travelAnimation){if(keys.arrowleft||keys.a)vx-=1;if(keys.arrowright||keys.d)vx+=1}
 if(vx){hero.x=Math.max(45,Math.min(WORLD_WIDTH-55,hero.x+vx*177*dt));hero.walk+=dt*19}
 const targetCam=Math.max(0,Math.min(WORLD_WIDTH-W,hero.x-240));camera+=(targetCam-camera)*Math.min(1,dt*8);
 nearby=stationsOnFloor(save.region,hero.floor).find(m=>Math.abs(hero.x-locs[m.index])<58)||null;
 const tip=$('#interactTip');if(!blocked()&&!travelAnimation&&nearby){tip.hidden=false;tip.textContent=isInteractable(nearby)?`[ E ] ${save.solved.includes(nearby.id)?'REPLAY':'DECODE'} · ${nearby.title.toUpperCase()}`:'[ LOCKED ] COMPLETE EARLIER SIGNALS'}else tip.hidden=true;
 $('#coordinates').textContent=`SECTOR ${pad(save.region+1)} · DECK ${hero.floor+1} · X ${pad(Math.round(hero.x),3)}`;
 renderWorld(t);requestAnimationFrame(frame)}
// Sanity checks for mission encodings and decoder pairs in development/browser console.
function validateMissions(){const problems=[];for(const m of missions){const encoded=encodeMission(m);let decoded='';switch(m.type){case 'caesar':decoded=cipher(encoded,-m.shift);break;case 'atbash':decoded=atbash(encoded);break;case 'a1z26':decoded=decodeNum(encoded);break;case 'reverse':decoded=reverse(encoded);break;case 'morse':decoded=decodeMorse(encoded);break;case 'binary':decoded=decodeBinary(encoded);break;case 'rail':decoded=decodeRail(encoded);break;case 'hex':decoded=decodeHex(encoded);break;case 'vigenere':decoded=vigenere(encoded,m.shift,true);break;case 'layer':decoded=reverse(cipher(encoded,-m.shift));break;case 'pigpen':decoded=m.answer}if(normalize(decoded)!==normalize(m.answer))problems.push({mission:m.id,decoded,answer:m.answer})}if(problems.length)console.error('Cipher Quest mission validation problems',problems);return problems}
window.CipherQuestTests={validateMissions,missions,regions,requiredRegion,floorOf,isUnlockedRegion,goToRegion,attemptVertical,encodeMission,decodeRail,encodeRail,encodeBinary,decodeBinary,encodeMorse,decodeMorse,encodeNum,decodeNum,encodeHex,decodeHex,vigenere,cipher,pigpenGlyph,normalize,reset:()=>localStorage.removeItem(SAVE_KEY)};
updateUI();modOpen('intro');
validateMissions();requestAnimationFrame(frame);
