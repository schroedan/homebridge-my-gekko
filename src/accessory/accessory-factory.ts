import { Categories, PlatformAccessory } from 'homebridge';
import { Blind } from '../api';
import { Platform } from '../platform';

export class AccessoryFactory {

    constructor(private readonly platform: Platform) {
    }

    createWindowCoveringAccessory(blind: Blind): PlatformAccessory {
        const uuid = this.platform.api.hap.uuid.generate(`my-gekko/blinds/${blind.key}`);
        const accessory = new (this.platform.api.platformAccessory)(blind.name, uuid, Categories.WINDOW_COVERING);

        accessory.addService(this.platform.api.hap.Service.WindowCovering);
        accessory.context.key = blind.key;

        return accessory;
    }
}
