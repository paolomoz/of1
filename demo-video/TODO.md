# Demo Video — TODO

## Completed

- [x] Extract frames from source video (every 2s, 50 frames)
- [x] Build frame analysis timeline with timestamps and screen content
- [x] Read of1 site content and brand voice guidelines
- [x] Define character and tone (website as narrator, provocatively calm)
- [x] Write script with act timelines synced to video
- [x] Identify backend panel transition points (~0:17 in, ~0:42 out)
- [x] Define intro slide spec (first frame + scrim + "Audiences of1")
- [x] Define outro slide spec (black #1C1917 + of1 logo + of1.live)

## Voice Selection

- [x] Check ElevenLabs API key (in /Users/paolo/excat/arco/.env)
- [x] Generate samples with George, Chris, Roger (too generic, no character)
- [x] Search for Italian accent voices in ElevenLabs library
- [x] Generate samples with Lorenzo Prada, Vittorio, Antonio, Luca
- [x] Pick Lorenzo Prada — refined Italian accent, mid-aged, classy
- [x] Tune parameters: A (baseline), B (slower+style), C (looser+rawer)
- [x] Final pick: Lorenzo C — stability=0.25, similarity=0.75, style=0.3, speed=0.95

## Font & Asset Setup

- [ ] Verify JetBrains Mono is installed locally (for PIL slide generation)
- [ ] Verify Cormorant Garamond is installed locally
- [ ] Download/install missing fonts if needed

## Music

- [x] Skipped — no music, voice-only. Revisit after first cut if needed.

## Build Setup

- [ ] Create build directory structure (audio/, images/, segments/)
- [ ] Write build.py script

## Slide Generation (PIL)

- [ ] Generate intro slide PNG (first frame + dark scrim + title)
- [ ] Generate outro slide PNG (black + of1 wordmark + of1.live)

## TTS Generation (ElevenLabs)

- [ ] Generate Act 1 audio (The Surface)
- [ ] Generate Act 2 audio (Behind the Glass)
- [ ] Generate Act 3 audio (The Learning)
- [ ] Generate Act 4 audio (The Payoff)
- [ ] Generate Act 5 audio (The Conversation)
- [ ] Generate Act 6 audio (The Deeper Connection)
- [ ] Generate Act 7 audio (Outro narration)

## Segment Assembly (ffmpeg)

- [ ] Build intro segment (slide + music)
- [ ] Build Act 1 segment (video 0:00–0:14 + VO)
- [ ] Build Act 2 segment (video 0:14–0:17 + VO + shade transition at panel appear)
- [ ] Build Act 3 segment (video 0:17–0:42 + VO)
- [ ] Build Act 4 segment (video 0:42–0:58 + VO + shade transition at panel disappear)
- [ ] Build Act 5 segment (video 0:58–1:18 + VO)
- [ ] Build Act 6 segment (video 1:18–1:40 + VO)
- [ ] Build outro segment (slide + VO + music)

## Final Assembly

- [ ] Write concat.txt manifest
- [ ] Concatenate all segments with re-encode
- [ ] Verify: audio on both channels, no sync drift, music doesn't overlap voice
- [ ] Review full video, note timing adjustments needed

## Iteration (if needed)

- [ ] Adjust script length for any over/under-length acts
- [ ] Re-generate affected TTS files
- [ ] Re-build affected segments
- [ ] Final render
