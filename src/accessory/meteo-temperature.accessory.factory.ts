import {
  API,
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';
import { UUID } from '../uuid';

let Accessory: typeof PlatformAccessory;
let Service: typeof PlatformService;

export class MeteoTemperatureAccessoryFactory {
  constructor(readonly api: API, readonly uuid: UUID) {
    Accessory = api.platformAccessory;
    Service = api.hap.Service;
  }

  async createAccessory(): Promise<PlatformAccessory> {
    const displayName = 'Meteo Temperature';
    const uuid = this.uuid.generate('meteo/temperature');
    const accessory = new Accessory(displayName, uuid, Categories.OTHER);

    accessory.context.type = 'meteo-temperature';
    accessory.addService(Service.TemperatureSensor);

    return accessory;
  }
}
