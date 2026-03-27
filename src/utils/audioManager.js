import { Audio } from "expo-av";

// Map of audio key → require() path
// Add your .mp3 files to assets/audio/ and update this map
const AUDIO_FILES = {
  night_start: require("../../assets/audio/night_start.mp3"),
  mafia_wake: require("../../assets/audio/mafia_wake.mp3"),
  mafia_sleep: require("../../assets/audio/mafia_sleep.mp3"),
  doctor_wake: require("../../assets/audio/doctor_wake.mp3"),
  doctor_sleep: require("../../assets/audio/doctor_sleep.mp3"),
  police_wake: require("../../assets/audio/police_wake.mp3"),
  police_sleep: require("../../assets/audio/police_sleep.mp3"),
  lady_wake: require("../../assets/audio/lady_wake.mp3"),
  lady_sleep: require("../../assets/audio/lady_sleep.mp3"),
  day_start: require("../../assets/audio/day_start.mp3"),
  // nobody_killed: require('../../assets/audio/nobody_killed.mp3'),
};

let currentSound = null;

export async function setupAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (e) {
    console.warn("[Audio] Setup failed:", e.message);
  }
}

export async function playSound(audioKey, onFinish) {
  try {
    await stopSound();

    const source = AUDIO_FILES[audioKey];
    if (!source) {
      // No file registered — call onFinish immediately so game continues
      onFinish?.();
      return null;
    }

    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      volume: 1.0,
    });

    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
        onFinish?.();
      }
    });

    return sound;
  } catch (e) {
    console.warn(`[Audio] Failed to play "${audioKey}":`, e.message);
    onFinish?.();
    return null;
  }
}

export async function stopSound() {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (_) {}
    currentSound = null;
  }
}

export function hasAudioFile(audioKey) {
  return !!AUDIO_FILES[audioKey];
}
