import { Logging, PlatformConfig } from 'homebridge';

import { BlindCharacteristics } from '../characteristics';
import { Interval } from '../interval';
import { PlatformEventEmitter } from '../platform-events';
import { BlindObserver } from './blind.observer';

export class BlindObserverFactory {
  constructor(
    readonly eventEmitter: PlatformEventEmitter,
    readonly logger: Logging,
    readonly heartbeat: Interval<() => void>,
    readonly config: PlatformConfig,
  ) {}

  createObserver(characteristics: BlindCharacteristics): BlindObserver {
    return new BlindObserver(
      characteristics,
      this.eventEmitter,
      this.logger,
      this.heartbeat,
      this.config,
    );
  }
}
