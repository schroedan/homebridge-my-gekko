import {
  API,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service as PlatformService,
} from 'homebridge';

import { QueryAPI } from '../api';
import { PlatformEventEmitter } from '../platform-events';
import { BlindCharacteristics } from './blind.characteristics';

let Service: typeof PlatformService;

export class BlindCharacteristicsFactory {
  constructor(
    readonly api: API,
    readonly queryAPI: QueryAPI,
    readonly config: PlatformConfig,
    readonly logger: Logging,
    readonly eventEmitter: PlatformEventEmitter,
  ) {
    Service = api.hap.Service;
  }

  async createCharacteristics(
    accessory: PlatformAccessory,
  ): Promise<BlindCharacteristics> {
    const service = accessory.getService(Service.WindowCovering);
    const blind = await this.queryAPI.getBlind(accessory.context.key);

    if (service === undefined) {
      throw new Error('Service not found.');
    }

    if (blind === undefined) {
      throw new Error('Blind not found.');
    }

    return new BlindCharacteristics(
      this.api,
      service,
      blind,
      this.config,
      this.logger,
      this.eventEmitter,
    );
  }
}
