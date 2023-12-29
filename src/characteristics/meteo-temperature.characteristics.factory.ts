import { API, PlatformAccessory, Service as PlatformService } from 'homebridge';
import { QueryAPI } from '../api';
import { MeteoTemperatureCharacteristics } from './meteo-temperature.characteristics';

let Service: typeof PlatformService;

export class MeteoTemperatureCharacteristicsFactory {
  constructor(
    readonly api: API,
    readonly queryAPI: QueryAPI,
  ) {
    Service = api.hap.Service;
  }

  async createCharacteristics(
    accessory: PlatformAccessory,
  ): Promise<MeteoTemperatureCharacteristics> {
    const service = accessory.getService(Service.TemperatureSensor);
    const meteo = await this.queryAPI.getMeteo();

    if (service === undefined) {
      throw new Error('Service not found.');
    }

    if (meteo === undefined) {
      throw new Error('Meteo not found.');
    }

    return new MeteoTemperatureCharacteristics(this.api, service, meteo);
  }
}
