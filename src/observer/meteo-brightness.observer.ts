import { Logging } from 'homebridge';

import { MeteoBrightnessCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';

export class MeteoBrightnessObserver {
  constructor(
    readonly characteristics: MeteoBrightnessCharacteristics,
    readonly eventEmitter: PlatformEventEmitter,
    readonly logger: Logging,
  ) {}

  registerListeners(): void {
    this.eventEmitter.onHeartbeat(() => {
      this.updateCurrentAmbientLightLevel().catch((reason) => {
        this.logger.error(reason);
      });
    });
  }

  async updateCurrentAmbientLightLevel(): Promise<void> {
    const value = await this.characteristics.getCurrentAmbientLightLevel();
    const unit = await this.characteristics.getUnit();

    if (this.characteristics.currentAmbientLightLevel.value === value) {
      return;
    }

    this.logger.debug(
      `Updating current ambient light level from ${this.characteristics.direction} of meteo: ${value} ${unit}`,
    );

    this.characteristics.updateCurrentAmbientLightLevel(value);
  }
}
