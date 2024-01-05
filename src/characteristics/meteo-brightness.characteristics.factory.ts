import { API, PlatformAccessory, Service as PlatformService } from 'homebridge';

import { QueryAPI } from '../api';
import { MeteoBrightnessCharacteristics } from './meteo-brightness.characteristics';

let Service: typeof PlatformService;

export class MeteoBrightnessCharacteristicsFactory {
  constructor(
    readonly api: API,
    readonly queryAPI: QueryAPI,
  ) {
    Service = api.hap.Service;
  }

  async createCharacteristics(
    accessory: PlatformAccessory,
  ): Promise<MeteoBrightnessCharacteristics> {
    const service = accessory.getService(Service.LightSensor);
    const meteo = await this.queryAPI.getMeteo();

    if (service === undefined) {
      throw new Error('Service not found.');
    }

    if (meteo === undefined) {
      throw new Error('Meteo not found.');
    }

    return new MeteoBrightnessCharacteristics(this.api, service, meteo);
  }
}
