import {
  API,
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';

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

  createAccessory(displayName: string, key: string): PlatformAccessory {
    const uuid = this.uuid.generate(`blinds/${key}`);
    const accessory = new Accessory(
      displayName,
      uuid,
      Categories.WINDOW_COVERING,
    );

    accessory.context.key = key;
    accessory.context.type = 'blind';
    accessory.addService(Service.WindowCovering);

    return accessory;
  }
}
