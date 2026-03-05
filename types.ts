
export type Theme = 'light' | 'dark';

export interface RadioState {
  /**
   * Whether the audio element is actively trying to play the stream.
   * This can be true even when muted (we keep the connection open).
   */
  isPlaying: boolean;
  /**
   * Whether the audio output is silenced. The stream may still be
   * downloading in the background.
   */
  isMuted: boolean;
  volume: number;
}
