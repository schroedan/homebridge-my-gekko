import { Logging, PlatformConfig } from 'homebridge';
import { MockProxy } from 'jest-mock-extended';

import { Interval } from '../interval';
import { PlatformEventEmitter } from '../platform-events';
import {
  mockBlindCharacteristics,
  mockInterval,
  mockLogging,
  mockPlatformConfig,
  mockPlatformEventEmitter,
} from '../test/mocks';
import { BlindObserver } from './blind.observer';
import { BlindObserverFactory } from './blind.observer.factory';

describe('Blind Observer Factory', () => {
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  let heartbeat: MockProxy<Interval<() => void>>;
  let config: MockProxy<PlatformConfig>;
  beforeEach(() => {
    eventEmitter = mockPlatformEventEmitter();
    logger = mockLogging();
    heartbeat = mockInterval();
    config = mockPlatformConfig();
  });
  it('should create observer', async () => {
    const characteristics = mockBlindCharacteristics();

    const blind = new BlindObserverFactory(
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    expect(blind.createObserver(characteristics)).toBeInstanceOf(BlindObserver);
  });
});
