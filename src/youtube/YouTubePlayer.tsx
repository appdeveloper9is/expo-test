/**
 * YouTube player for iOS, Android and web (one file).
 * - iOS / Android: YouTube IFrame API inside a WebView.
 * - Web: the same IFrame API loaded directly into the page (WebView doesn't run on web).
 */
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import type { Ref } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface YouTubePlayerHandle {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
}

interface Props {
  videoId: string;
  ref?: Ref<YouTubePlayerHandle>;
  onPlayingChange?: (playing: boolean) => void;
}

// YT.PlayerState: 1 = playing, 3 = buffering.
const isPlayingState = (state: number): boolean => state === 1 || state === 3;

export function YouTubePlayer(props: Props): React.JSX.Element {
  return Platform.OS === 'web' ? <WebPlayer {...props} /> : <NativePlayer {...props} />;
}

// ---------- iOS / Android ----------

// YouTube rejects embeds without a valid https origin.
const ORIGIN = 'https://localhost';

const html = (videoId: string) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{margin:0;height:100%;background:#000}#player{position:absolute;inset:0}</style>
</head><body><div id="player"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script>
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    width: '100%', height: '100%',
    videoId: ${JSON.stringify(videoId)},
    playerVars: { playsinline: 1, rel: 0, origin: '${ORIGIN}' },
    events: { onStateChange: function (e) { window.ReactNativeWebView.postMessage(String(e.data)); } }
  });
}
</script></body></html>`;

function NativePlayer({ videoId, ref, onPlayingChange }: Props): React.JSX.Element {
  const webView = useRef<WebView>(null);
  const run = (js: string) => webView.current?.injectJavaScript(`player && ${js}; true;`);

  useImperativeHandle(ref, () => ({
    play: () => run('player.playVideo()'),
    pause: () => run('player.pauseVideo()'),
    seekTo: (seconds) => run(`player.seekTo(${Number(seconds)}, true)`),
  }));

  return (
    <View style={styles.frame}>
      <WebView
        ref={webView}
        source={{ html: html(videoId), baseUrl: ORIGIN }}
        onMessage={(e) => onPlayingChange?.(isPlayingState(Number(e.nativeEvent.data)))}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        style={styles.webView}
      />
    </View>
  );
}

// ---------- Web ----------

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
}

type YTGlobal = { Player: new (el: HTMLElement, options: object) => YTPlayer };

let apiReady: Promise<YTGlobal> | null = null;

/** Load https://www.youtube.com/iframe_api once per page. */
function loadApi(): Promise<YTGlobal> {
  const w = window as unknown as { YT?: YTGlobal; onYouTubeIframeAPIReady?: () => void };
  apiReady ??= new Promise((resolve) => {
    if (w.YT?.Player) return resolve(w.YT);
    w.onYouTubeIframeAPIReady = () => resolve(w.YT as YTGlobal);
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return apiReady;
}

function WebPlayer({ videoId, ref, onPlayingChange }: Props): React.JSX.Element {
  const host = useRef<View>(null);
  const player = useRef<YTPlayer | null>(null);
  const onChange = useRef(onPlayingChange);
  onChange.current = onPlayingChange;

  useImperativeHandle(ref, () => ({
    play: () => player.current?.playVideo(),
    pause: () => player.current?.pauseVideo(),
    seekTo: (seconds) => player.current?.seekTo(seconds, true),
  }));

  useEffect(() => {
    const container = host.current as unknown as HTMLElement; // a View renders a <div> on web
    const mount = document.createElement('div');
    container.appendChild(mount);
    let cancelled = false;
    loadApi().then((YT) => {
      if (cancelled) return;
      player.current = new YT.Player(mount, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: { playsinline: 1, rel: 0 },
        events: { onStateChange: (e: { data: number }) => onChange.current?.(isPlayingState(e.data)) },
      });
    });
    return () => {
      cancelled = true;
      player.current?.destroy();
      player.current = null;
      container.replaceChildren();
    };
  }, [videoId]);

  return <View ref={host} style={styles.frame} />;
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', overflow: 'hidden' },
  webView: { backgroundColor: '#000' },
});
