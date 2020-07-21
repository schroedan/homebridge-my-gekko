import { Categories, PlatformAccessory } from 'homebridge';
import { Blind, Meteo } from '../api';
import { Platform } from '../platform';

export const TEMPERATURE_SENSOR_NAME = 'Temperature';

export class AccessoryFactory {

    constructor(private readonly platform: Platform) {
    }

    createTemperatureSensorAccessory(meteo: Meteo): PlatformAccessory {
        const uuid = this.platform.api.hap.uuid.generate(`my-gekko/globals/meteo/temperature`);
        const accessory = new (this.platform.api.platformAccessory)(TEMPERATURE_SENSOR_NAME, uuid, Categories.OTHER);

        accessory.addService(this.platform.api.hap.Service.TemperatureSensor);

        return accessory;
    }

    createWindowCoveringAccessory(blind: Blind): PlatformAccessory {
        const uuid = this.platform.api.hap.uuid.generate(`my-gekko/blinds/${blind.key}`);
        const accessory = new (this.platform.api.platformAccessory)(blind.name, uuid, Categories.WINDOW_COVERING);

        accessory.addService(this.platform.api.hap.Service.WindowCovering);
        accessory.context.key = blind.key;

        return accessory;
    }
}
