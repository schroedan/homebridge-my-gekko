import { Logging } from 'homebridge';
import { MeteoBrightnessCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';
import { MeteoBrightnessObserver } from './meteo-brightness.observer';

export class MeteoBrightnessObserverFactory {
  constructor(
    readonly eventEmitter: PlatformEventEmitter,
    readonly logger: Logging,
  ) {}

  createObserver(
    characteristics: MeteoBrightnessCharacteristics,
  ): MeteoBrightnessObserver {
    return new MeteoBrightnessObserver(
      characteristics,
      this.eventEmitter,
      this.logger,
    );
  }
}
