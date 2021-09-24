import { Logging } from 'homebridge';
import { MeteoTemperatureCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';

export class MeteoTemperatureObserver {
  constructor(
    readonly characteristics: MeteoTemperatureCharacteristics,
    readonly eventEmitter: PlatformEventEmitter,
    readonly logger: Logging,
  ) {}

  registerListeners(): void {
    this.eventEmitter.onHeartbeat(() => {
      this.updateCurrentTemperature().catch((reason) => {
        this.logger.error(reason);
      });
    });
  }

  async updateCurrentTemperature(): Promise<void> {
    const value = await this.characteristics.getTemperature();
    const unit = await this.characteristics.getUnit();

    if (this.characteristics.currentTemperature.value === value) {
      return;
    }

    this.logger.debug(
      `Updating current temperature of meteo: ${value} ${unit}`,
    );

    this.characteristics.updateCurrentTemperature(value);
  }
}
