import { Logging } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';

import { MeteoTemperatureCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';
import { MeteoTemperatureObserver } from './meteo-temperature.observer';
import { MeteoTemperatureObserverFactory } from './meteo-temperature.observer.factory';

describe('Meteo Temperature Observer Factory', () => {
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  beforeEach(() => {
    eventEmitter = mock<PlatformEventEmitter>();
    logger = mock<Logging>();
  });
  it('should create observer', async () => {
    const characteristics = mock<MeteoTemperatureCharacteristics>();

    const meteoTemperature = new MeteoTemperatureObserverFactory(
      eventEmitter,
      logger,
    );

    expect(meteoTemperature.createObserver(characteristics)).toBeInstanceOf(
      MeteoTemperatureObserver,
    );
  });
});
