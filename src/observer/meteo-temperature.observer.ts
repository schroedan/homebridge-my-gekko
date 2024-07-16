import { CharacteristicValue, Logging } from 'homebridge';

import { MeteoTemperatureCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';

export class MeteoTemperatureObserver {
  private cachedValues: CharacteristicValue[] = [];

  constructor(
    readonly characteristics: MeteoTemperatureCharacteristics,
    readonly eventEmitter: PlatformEventEmitter,
    readonly logger: Logging,
    readonly cacheSize: number,
  ) {}

  registerListeners(): void {
    this.eventEmitter.onHeartbeat(() => {
      this.updateCurrentTemperature().catch((reason) => {
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

  async updateCurrentTemperature(): Promise<void> {
    const averageValue = this.calculateAverageValue(
      await this.characteristics.getTemperature(),
    );

    const value = Math.round(Number(averageValue) * 100) / 100;
    const unit = await this.characteristics.getUnit();

    if (
      Math.round(
        Number(this.characteristics.currentTemperature.value) * 100,
      ) === Math.round(Number(value) * 100)
    ) {
      return;
    }

    this.logger.debug(
      `Updating current temperature of meteo: ${value} ${unit}`,
    );

    this.characteristics.updateCurrentTemperature(value);
  }
}
