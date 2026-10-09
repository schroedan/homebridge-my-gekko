import { Logging } from 'homebridge';
import { MockProxy } from 'jest-mock-extended';

import { PlatformEventEmitter } from '../platform-events';
import {
  mockLogging,
  mockMeteoTemperatureCharacteristics,
  mockPlatformEventEmitter,
} from '../test/mocks';
import { MeteoTemperatureObserver } from './meteo-temperature.observer';
import { MeteoTemperatureObserverFactory } from './meteo-temperature.observer.factory';

describe('Meteo Temperature Observer Factory', () => {
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  beforeEach(() => {
    eventEmitter = mockPlatformEventEmitter();
    logger = mockLogging();
  });
  it('should create observer', async () => {
    const characteristics = mockMeteoTemperatureCharacteristics();

    const meteoTemperature = new MeteoTemperatureObserverFactory(
      eventEmitter,
      logger,
    );

    expect(meteoTemperature.createObserver(characteristics)).toBeInstanceOf(
      MeteoTemperatureObserver,
    );
  });
});
