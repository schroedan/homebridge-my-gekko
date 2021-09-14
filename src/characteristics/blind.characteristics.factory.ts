import { PlatformAccessory, Service as PlatformService } from 'homebridge';
import { Container } from '../container';
import { BlindCharacteristics } from './blind.characteristics';

let Service: typeof PlatformService;

export class BlindCharacteristicsFactory {
  constructor(readonly container: Container) {
    Service = container.platform.api.hap.Service;
  }

  async createCharacteristics(
    accessory: PlatformAccessory,
  ): Promise<BlindCharacteristics> {
    const service = accessory.getService(Service.WindowCovering);
    const blind = await this.container.queryAPI.getBlind(accessory.context.key);

    if (service === undefined) {
      throw new Error('Service not found.');
    }

    if (blind === undefined) {
      throw new Error('Blind not found.');
    }

    return new BlindCharacteristics(this.container, service, blind);
  }
}
