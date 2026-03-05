// @ts-ignore
import { Howl } from 'howler';

export const SFX: Record<string, Howl> = {
  homewhoosh : new Howl({
        src: ['sounds/home_whoosh.mp3'],
        volume: 0.8, 
        preload: true,
        html5: false, 
    }),
  bio_whoosh : new Howl({
        src: ['sounds/bio_whoosh.mp3'],
        volume: 0.8,
        preload: true, 
        html5: false, 
    }),
  links_whoosh : new Howl({
        src: ['sounds/links_whoosh.mp3'],
        volume: 0.8,
        preload: true, 
        html5: false, 
    }),
  stuck_whoosh : new Howl({
        src: ['sounds/stuck_whoosh.mp3'],
        volume: 0.5, 
        preload: true,
        html5: false, 
    }),
  intro_whoosh : new Howl({
        src: ['sounds/intro_whoosh.mp3'],
        volume: 0.8, 
        preload: true,
        html5: false, 
    }),
  hover_pop : new Howl({
        src: ['sounds/pop.mp3'],
        volume: 0.4, 
        preload: true,
        html5: false, 
    }),
  hover_whoop : new Howl({
        src: ['sounds/label.mp3'],
        volume: 1, 
        preload: true,
        html5: false, 
    }),
}
