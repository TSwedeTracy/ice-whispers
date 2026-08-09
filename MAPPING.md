# Artwork mapping — please verify (~5 minutes)

Your uploaded files are already numbered (`1.png`...`24.png`, `2_.png`),
which matches the standard Elder Futhark order. I've mapped them
accordingly in `lib/rune-assets.ts`:

| # | File | Rune |
|---|------|------|
| 1 | 1.png | Fehu |
| 2 | 2_.png → 2.png | Uruz |
| 3 | 3.png | Thurisaz |
| 4 | 4.png | Ansuz |
| 5 | 5.png | Raidho |
| 6 | 6.png | Kenaz |
| 7 | 7.png | Gebo |
| 8 | 8.png | Wunjo |
| 9 | 9.png | Hagalaz |
| 10 | 10.png | Nauthiz |
| 11 | 11.png | Isa |
| 12 | 12.png | Jera |
| 13 | 13.png | Eihwaz |
| 14 | 14.png | Perthro |
| 15 | 15.png | Algiz |
| 16 | 16.png | Sowilo |
| 17 | 17.png | Tiwaz |
| 18 | 18.png | Berkano |
| 19 | 19.png | Ehwaz |
| 20 | 20.png | Mannaz |
| 21 | 21.png | Laguz |
| 22 | 22.png | Ingwaz |
| 23 | 23.png | Dagaz |
| 24 | 24.png | Othala |
| — | Baksida_NY.png → back.png | Card back |
| — | 0_Wyrd_.png → 0-wyrd.png | Wyrd (25th card) |
| — | framsida_ICE_Whispers_.png → cover.png | Deck cover |

**Why this matters:** each card's glowing rune symbol should match its
name — e.g. the "F"-shaped glow with a treasure chest should be Fehu, the
"X" gift-exchange scene should be Gebo, and so on.

**To verify:** open `/public/cards/`, and for each numbered file, check the
glowing symbol at the top against the rune's traditional shape (a quick
image search for "Elder Futhark [rune name]" shows the reference shape).
If any are swapped, just edit the `filenameById` map in
`lib/rune-assets.ts` — nothing else needs to change.
