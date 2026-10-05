# 🔊 Custom Audio Sound Effects Folder

You can place custom MP3 sound files in this directory (`src/assets/audio/`) to override the built-in sound effects:

- `punch.mp3` -> Played on light punches, heavy kicks, and strikes
- `thud.mp3` -> Played on heavy mat slams and ground knockdowns
- `rope.mp3` -> Played on rope rebounds and ground roll slides
- `bell.mp3` -> Played on round intro and match completion
- `you_lose.mp3` -> Played on player KO defeat
- `crowd.mp3` -> Continuous crowd atmosphere/cheering loop (volume scales dynamically with combo streak)

If an MP3 file is not found, the sound engine automatically falls back to built-in Web Audio API sound synthesis.
