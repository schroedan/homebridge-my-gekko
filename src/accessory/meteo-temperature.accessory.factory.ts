import {
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';
import { Container } from '../container';

let Accessory: typeof PlatformAccessory;
let Service: typeof PlatformService;

export class MeteoTemperatureAccessoryFactory {
  constructor(readonly container: Container) {
    Accessory = container.platform.api.platformAccessory;
    Service = container.platform.api.hap.Service;
  }

  async createAccessory(): Promise<PlatformAccessory> {
    const displayName = 'Meteo Temperature';
    const uuid = this.container.platform.generateUUID('meteo/temperature');
    const accessory = new Accessory(displayName, uuid, Categories.OTHER);

    accessory.context.type = 'meteo-temperature';
    accessory.addService(Service.TemperatureSensor);

    return accessory;
  }
}
