import { CharacteristicValue, Logging } from 'homebridge';

import { MeteoBrightnessCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';

export class MeteoBrightnessObserver {
  private cachedValues: CharacteristicValue[] = [];

  constructor(
    readonly characteristics: MeteoBrightnessCharacteristics,
    readonly eventEmitter: PlatformEventEmitter,
    readonly logger: Logging,
    readonly cacheSize: number,
  ) {}

  registerListeners(): void {
    this.eventEmitter.onHeartbeat(() => {
      this.updateCurrentAmbientLightLevel().catch((reason) => {
        this.logger.error(reason);
      });
    });
  }

  protected calculateAverageValue(
    value: CharacteristicValue,
  ): CharacteristicValue {
    this.cachedValues.push(value);
    this.cachedValues = this.cachedValues.slice(-1 * this.cacheSize);

    return (
      this.cachedValues.reduce((sum: number, value) => sum + Number(value), 0) /
      this.cachedValues.length
    );
  }

  async updateCurrentAmbientLightLevel(): Promise<void> {
    const averageValue = this.calculateAverageValue(
      await this.characteristics.getCurrentAmbientLightLevel(),
    );

    const value = Math.round(Number(averageValue) * 100) / 100;
    const unit = await this.characteristics.getUnit();

    if (
      Math.round(
        Number(this.characteristics.currentAmbientLightLevel.value) * 100,
      ) === Math.round(Number(value) * 100)
    ) {
      return;
    }

    this.logger.debug(
      `Updating current ambient light level from ${this.characteristics.direction} of meteo: ${value} ${unit}`,
    );

    this.characteristics.updateCurrentAmbientLightLevel(value);
  }
}
