import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { YouTubePlayer } from '../youtube/YouTubePlayer';
import type { YouTubePlayerHandle } from '../youtube/YouTubePlayer';

const VIDEO_ID = 'M7lc1UVf-VE';
const JUMP_TO_SECONDS = 15;

function Button({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, active && styles.buttonActive, pressed && styles.pressed]}
    >
      <Text style={[styles.buttonText, active && styles.buttonTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function DemoScreen(): React.JSX.Element {
  const isWide = useWindowDimensions().width >= 768;
  const player = useRef<YouTubePlayerHandle>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={[styles.content, isWide && styles.contentWide]}>
        <View style={isWide ? styles.main : undefined}>
          <YouTubePlayer ref={player} videoId={VIDEO_ID} onPlayingChange={setIsPlaying} />
        </View>

        <View style={[styles.panel, isWide && styles.side]}>
          <View style={styles.row}>
            <Button
              label={isPlaying ? 'Pause' : 'Play'}
              active
              onPress={() => (isPlaying ? player.current?.pause() : player.current?.play())}
            />
            <Button label="Jump to 0:15" onPress={() => player.current?.seekTo(JUMP_TO_SECONDS)} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, alignItems: 'center', backgroundColor: '#f2f2f7', flexGrow: 1 },
  content: { width: '100%', maxWidth: 1200, gap: 16 },
  contentWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 3 },
  side: { flex: 2 },
  panel: { gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d1d6',
    backgroundColor: '#fff',
  },
  buttonActive: { backgroundColor: '#0a63c9', borderColor: '#0a63c9' },
  pressed: { opacity: 0.7 },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#1c1c1e' },
  buttonTextActive: { color: '#fff' },
});
