import { Logging } from 'homebridge';
import { MockProxy } from 'jest-mock-extended';

import { PlatformEventEmitter } from '../platform-events';
import {
  mockLogging,
  mockMeteoBrightnessCharacteristics,
  mockPlatformEventEmitter,
} from '../test/mocks';
import { MeteoBrightnessObserver } from './meteo-brightness.observer';
import { MeteoBrightnessObserverFactory } from './meteo-brightness.observer.factory';

describe('Meteo Brightness Observer Factory', () => {
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  beforeEach(() => {
    eventEmitter = mockPlatformEventEmitter();
    logger = mockLogging();
  });
  it('should create observer', async () => {
    const characteristics = mockMeteoBrightnessCharacteristics();

    const meteoBrightness = new MeteoBrightnessObserverFactory(
      eventEmitter,
      logger,
    );

    expect(meteoBrightness.createObserver(characteristics)).toBeInstanceOf(
      MeteoBrightnessObserver,
    );
  });
});
