
export type Theme = 'light' | 'dark';

export interface RadioState {
  /**
   * Whether the stream is currently audible to the user.
   */
  isPlaying: boolean;
  volume: number;
}
