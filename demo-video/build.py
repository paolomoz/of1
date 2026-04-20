#!/usr/bin/env python3
"""Build script for of1 demo video."""

import subprocess, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
SRC_VIDEO = "/Users/paolo/Desktop/arco-coffee-3.mov"
AUDIO_DIR = os.path.join(BASE, "audio")
IMAGE_DIR = os.path.join(BASE, "images")
SEG_DIR = os.path.join(BASE, "segments")
OUTPUT = os.path.join(BASE, "of1-demo.mp4")

os.makedirs(SEG_DIR, exist_ok=True)

ENC_VIDEO = "-c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 25"
ENC_AUDIO = "-c:a aac -ac 2 -b:a 192k"
SCALE = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"


def run(cmd):
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"STDERR: {result.stderr}")
        sys.exit(1)
    return result.stdout.strip()


def probe_duration(path):
    out = run(f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{path}"')
    return float(out)


def build_intro():
    """Intro slide (4s, silent)."""
    out = os.path.join(SEG_DIR, "00-intro.mp4")
    if os.path.exists(out):
        print(f"Skipping {out} (exists)")
        return
    run(
        f'ffmpeg -y -loop 1 -i "{IMAGE_DIR}/intro.png" -f lavfi -i anullsrc=r=44100:cl=stereo '
        f'-t 1 -shortest {ENC_VIDEO} {ENC_AUDIO} "{out}"'
    )


def build_video_act(act_num, start, end, audio_file, seg_name, darken_start=False, darken_end=False):
    """Video act with voiceover and optional freeze-frame extension."""
    out = os.path.join(SEG_DIR, f"{seg_name}.mp4")
    if os.path.exists(out):
        print(f"Skipping {out} (exists)")
        return

    audio_path = os.path.join(AUDIO_DIR, audio_file)
    audio_dur = probe_duration(audio_path)
    video_dur = end - start
    total_dur = max(video_dur, audio_dur + 0.3)
    pad_time = max(0, total_dur - video_dur)

    vf = SCALE
    if pad_time > 0:
        vf += f",tpad=stop_mode=clone:stop_duration={pad_time:.2f}"

    if darken_end:
        vf += f",fade=t=out:st={total_dur - 0.5:.2f}:d=0.5"

    if darken_start:
        vf += f",fade=t=in:st=0:d=0.5"

    af = "adelay=300|300,aresample=async=1,pan=stereo|c0=c0|c1=c0"

    run(
        f'ffmpeg -y -ss {start} -to {end} -i "{SRC_VIDEO}" -i "{audio_path}" '
        f'-filter_complex "[0:v]{vf}[vout];[1:a]{af}[aout]" '
        f'-map "[vout]" -map "[aout]" -t {total_dur:.2f} {ENC_VIDEO} {ENC_AUDIO} "{out}"'
    )


def build_outro():
    """Outro slide with voiceover."""
    out = os.path.join(SEG_DIR, "99-outro.mp4")
    if os.path.exists(out):
        print(f"Skipping {out} (exists)")
        return

    audio_path = os.path.join(AUDIO_DIR, "act7.mp3")
    audio_dur = probe_duration(audio_path)
    total_dur = audio_dur + 1.0  # 1s padding after voice ends

    af = "adelay=300|300,aresample=async=1,apad=pad_dur={:.2f},pan=stereo|c0=c0|c1=c0".format(total_dur)

    run(
        f'ffmpeg -y -loop 1 -i "{IMAGE_DIR}/outro.png" -i "{audio_path}" '
        f'-filter_complex "[1:a]{af}[aout]" '
        f'-map 0:v -map "[aout]" -t {total_dur:.2f} {ENC_VIDEO} {ENC_AUDIO} "{out}"'
    )


def concatenate():
    """Join all segments into final video."""
    if os.path.exists(OUTPUT):
        print(f"Skipping {OUTPUT} (exists)")
        return

    concat_file = os.path.join(BASE, "concat.txt")
    segments = sorted(f for f in os.listdir(SEG_DIR) if f.endswith(".mp4"))
    with open(concat_file, "w") as f:
        for seg in segments:
            f.write(f"file 'segments/{seg}'\n")

    print(f"\nConcat manifest ({len(segments)} segments):")
    for s in segments:
        print(f"  {s}")

    run(
        f'ffmpeg -y -f concat -safe 0 -i "{concat_file}" '
        f'{ENC_VIDEO} {ENC_AUDIO} "{OUTPUT}"'
    )


if __name__ == "__main__":
    print("=== Building of1 demo video ===\n")

    # Step 1: Intro slide
    print("\n--- Intro ---")
    build_intro()

    # Step 2: Video acts
    # Act 1: The Surface (0:00-0:14)
    print("\n--- Act 1: The Surface ---")
    build_video_act(1, 0, 14, "act1.mp3", "01-surface")

    # Act 2: Behind the Glass (0:14-0:17) — darken at end as backend panel appears
    print("\n--- Act 2: Behind the Glass ---")
    build_video_act(2, 14, 17, "act2.mp3", "02-glass", darken_end=True)

    # Act 3: The Learning (0:17-0:42)
    print("\n--- Act 3: The Learning ---")
    build_video_act(3, 17, 42, "act3.mp3", "03-learning")

    # Act 4: The Payoff (0:42-0:58) — brighten at start as panel disappears
    print("\n--- Act 4: The Payoff ---")
    build_video_act(4, 42, 58, "act4.mp3", "04-payoff", darken_start=True)

    # Act 5: The Conversation (0:58-1:18)
    print("\n--- Act 5: The Conversation ---")
    build_video_act(5, 58, 78, "act5.mp3", "05-conversation")

    # Act 6: The Deeper Connection (1:18-1:40)
    print("\n--- Act 6: The Deeper Connection ---")
    build_video_act(6, 78, 100, "act6.mp3", "06-connection")

    # Step 3: Outro slide
    print("\n--- Outro ---")
    build_outro()

    # Step 4: Concatenate
    print("\n--- Final Assembly ---")
    concatenate()

    print(f"\n=== Done: {OUTPUT} ===")
    subprocess.run(["open", OUTPUT])
