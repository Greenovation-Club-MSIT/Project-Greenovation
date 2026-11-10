class ValoAudio {
  private hoverAudio: HTMLAudioElement | null = null;
  private clickAudio: HTMLAudioElement | null = null;
  private isMuted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // These files must exist in public/sounds/
      this.hoverAudio = new Audio('/sounds/hover.mp3');
      this.clickAudio = new Audio('/sounds/click.mp3');
      
      // Fine-tune default volumes
      this.hoverAudio.volume = 0.5;
      this.clickAudio.volume = 0.5;

      // Preload them
      this.hoverAudio.preload = 'auto';
      this.clickAudio.preload = 'auto';
    }
  }

  playHover() {
    if (this.isMuted || !this.hoverAudio) return;
    this.hoverAudio.currentTime = 0;
    this.hoverAudio.play().catch(() => {
      // Silently catch autoplay restrictions
    });
  }

  playClick() {
    if (this.isMuted || !this.clickAudio) return;
    this.clickAudio.currentTime = 0;
    this.clickAudio.play().catch(() => {});
  }

  unlock() {
    // Optional: dummy play to unlock audio context in browsers requiring user interaction
    if (this.hoverAudio) {
      const vol = this.hoverAudio.volume;
      this.hoverAudio.volume = 0;
      this.hoverAudio.play().catch(() => {});
      setTimeout(() => { 
        if (this.hoverAudio) this.hoverAudio.volume = vol; 
      }, 50);
    }
  }
}

export const valoAudio = new ValoAudio();
