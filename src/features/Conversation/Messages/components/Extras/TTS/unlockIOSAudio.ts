// iOS audio-session unlock for TTS playback.
//
// Symptom this addresses: on iOS Safari/PWA, TTS audio plays "silently" — the
// UI shows playing state, but no sound (or routed through earpiece instead of
// speaker). Root cause is the iOS audio session category: once any code path
// has touched the microphone (STT, voice input), iOS sticks the session in
// `PlayAndRecord` mode, which routes subsequent playback to the earpiece and
// blocks A2DP/Bluetooth speakers.
//
// Mechanism: creating and resuming an AudioContext inside a user-gesture call
// stack forces iOS to evaluate the audio session category. By playing a
// 1-sample silent buffer through the context's destination, we anchor the
// session in `Playback` mode for the remainder of the page session. Web Audio
// and HTML5 <audio> share the iOS system-level audio session, so this
// transition is inherited by lobehub's underlying <audio> element.
//
// Same mechanism as the drive-ai-v2 fix shipped on 2026-05-09 (master
// 3f3c6c85). Lobehub's useAudioPlayer uses HTML5 <audio>, not Web Audio API;
// this fix is system-level and works alongside that.
//
// Known limitation: this unlock must run inside an active user-gesture stack.
// InitPlayer's auto-start fires from setTimeout(100ms), which iOS no longer
// treats as gesture context — so for auto-play TTS this is best-effort. For
// the FilePlayer manual-replay path (user taps the play button), the gesture
// chain is intact and this fully unlocks playback.

let unlocked = false;

const isIOS = (): boolean => {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
};

export const unlockIOSAudio = async (): Promise<void> => {
  if (unlocked || !isIOS()) return;
  try {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const buffer = ctx.createBuffer(1, 1, 22_050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    unlocked = true;
  } catch {
    // iOS audio unlock is best-effort; failure means lobehub's HTML5 audio
    // path will still attempt to play, just without the session-category nudge.
  }
};
