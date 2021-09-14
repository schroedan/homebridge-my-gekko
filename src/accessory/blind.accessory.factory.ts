import {
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';
import { Blind as BlindAPI } from '../api';
import { Container } from '../container';

let Accessory: typeof PlatformAccessory;
let Service: typeof PlatformService;

export class BlindAccessoryFactory {
  constructor(readonly container: Container) {
    Accessory = container.platform.api.platformAccessory;
    Service = container.platform.api.hap.Service;
  }

  async createAccessory(api: BlindAPI): Promise<PlatformAccessory> {
    const displayName = await api.getName();
    const uuid = this.container.platform.generateUUID(`blinds/${api.key}`);
    const accessory = new Accessory(
      displayName,
      uuid,
      Categories.WINDOW_COVERING,
    );

    accessory.context.key = api.key;
    accessory.context.type = 'blind';
    accessory.addService(Service.WindowCovering);

    return accessory;
  }
}
