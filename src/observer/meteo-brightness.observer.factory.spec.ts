import { Logging } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';

import { MeteoBrightnessCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';
import { MeteoBrightnessObserver } from './meteo-brightness.observer';
import { MeteoBrightnessObserverFactory } from './meteo-brightness.observer.factory';

describe('Meteo Brightness Observer Factory', () => {
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  beforeEach(() => {
    eventEmitter = mock<PlatformEventEmitter>();
    logger = mock<Logging>();
  });
  it('should create observer', async () => {
    const characteristics = mock<MeteoBrightnessCharacteristics>();

    const meteoBrightness = new MeteoBrightnessObserverFactory(
      eventEmitter,
      logger,
    );

    expect(meteoBrightness.createObserver(characteristics)).toBeInstanceOf(
      MeteoBrightnessObserver,
    );
  });
});
