import {
  API,
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';

import { BlindAPI } from '../api';
import { UUID } from '../uuid';

let Accessory: typeof PlatformAccessory;
let Service: typeof PlatformService;

export class BlindAccessoryFactory {
  constructor(
    readonly api: API,
    readonly uuid: UUID,
  ) {
    Accessory = api.platformAccessory;
    Service = api.hap.Service;
  }

  async createAccessory(blind: BlindAPI): Promise<PlatformAccessory> {
    const displayName = await blind.getName();
    const uuid = this.uuid.generate(`blinds/${blind.key}`);
    const accessory = new Accessory(
      displayName,
      uuid,
      Categories.WINDOW_COVERING,
    );

    accessory.context.key = blind.key;
    accessory.context.type = 'blind';
    accessory.addService(Service.WindowCovering);

    return accessory;
  }
}
