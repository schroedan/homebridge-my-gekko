import {
  API,
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';
import { UUID } from '../uuid';

let Accessory: typeof PlatformAccessory;
let Service: typeof PlatformService;

export class MeteoBrightnessAccessoryFactory {
  constructor(
    readonly api: API,
    readonly uuid: UUID,
  ) {
    Accessory = api.platformAccessory;
    Service = api.hap.Service;
  }

  async createAccessory(): Promise<PlatformAccessory> {
    const displayName = 'Meteo Brightness';
    const uuid = this.uuid.generate('meteo/brightness');
    const accessory = new Accessory(displayName, uuid, Categories.OTHER);

    accessory.context.type = 'meteo-brightness';
    accessory.addService(Service.LightSensor);

    return accessory;
  }
}
