import { Logging } from 'homebridge';

import { MeteoTemperatureCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';
import { MeteoTemperatureObserver } from './meteo-temperature.observer';

export class MeteoTemperatureObserverFactory {
  constructor(
    readonly eventEmitter: PlatformEventEmitter,
    readonly logger: Logging,
  ) {}

  createObserver(
    characteristics: MeteoTemperatureCharacteristics,
  ): MeteoTemperatureObserver {
    return new MeteoTemperatureObserver(
      characteristics,
      this.eventEmitter,
      this.logger,
    );
  }
}
