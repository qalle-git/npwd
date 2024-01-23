export class Ringtone {
  private sound: any = null;

  constructor(private readonly ringtoneName: string) {
    this.ringtoneName = ringtoneName;
  }

  play(volume?: number): void {
    global.exports['x-sounds'].PlayNetSoundFromEntity(
      this.ringtoneName,
      PlayerPedId(),
      volume ?? global.exports['x-settings'].GetSetting('CALL_SOUND'),
      10.0,
      false,
      '.ogg',
      (theSound: any) => {
        this.sound = theSound;
      },
    );
  }

  stop(): void {
    if (this.sound !== null) {
      emitNet('soundeffects:removeSound', this.sound.netId);

      this.sound = null;
    }
  }

  static isPlaying(): boolean {
    return IsPedRingtonePlaying(PlayerPedId());
  }
}
