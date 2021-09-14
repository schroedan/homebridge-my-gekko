import { PlatformAccessory, Service as PlatformService } from 'homebridge';
import { Container } from '../container';
import { MeteoTemperatureCharacteristics } from './meteo-temperature.characteristics';

let Service: typeof PlatformService;

export class MeteoTemperatureCharacteristicsFactory {
  constructor(readonly container: Container) {
    Service = container.platform.api.hap.Service;
  }

  async createCharacteristics(
    accessory: PlatformAccessory,
  ): Promise<MeteoTemperatureCharacteristics> {
    const service = accessory.getService(Service.TemperatureSensor);
    const meteo = await this.container.queryAPI.getMeteo();

    if (service === undefined) {
      throw new Error('Service not found.');
    }

    if (meteo === undefined) {
      throw new Error('Meteo not found.');
    }

    return new MeteoTemperatureCharacteristics(this.container, service, meteo);
  }
}
