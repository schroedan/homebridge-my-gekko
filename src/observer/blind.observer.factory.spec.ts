import { Logging, PlatformConfig } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { BlindCharacteristics } from '../characteristics';
import { Interval } from '../interval';
import { PlatformEventEmitter } from '../platform-events';
import { BlindObserver } from './blind.observer';
import { BlindObserverFactory } from './blind.observer.factory';

describe('Blind Observer Factory', () => {
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  let heartbeat: MockProxy<Interval<() => void>>;
  let config: MockProxy<PlatformConfig>;
  beforeEach(() => {
    eventEmitter = mock<PlatformEventEmitter>();
    logger = mock<Logging>();
    heartbeat = mock<Interval<() => void>>();
    config = mock<PlatformConfig>();
  });
  it('should create observer', async () => {
    const characteristics = mock<BlindCharacteristics>();

    const blind = new BlindObserverFactory(
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    expect(blind.createObserver(characteristics)).toBeInstanceOf(BlindObserver);
  });
});
