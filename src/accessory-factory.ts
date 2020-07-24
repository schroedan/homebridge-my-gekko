import { Categories, HAP, Logging, PlatformAccessory, PlatformConfig } from 'homebridge';
import { Blind } from './api';
import { Platform, PLUGIN_IDENTIFIER } from './platform';

let Accessory: typeof PlatformAccessory;

export declare const enum AccessoryType {
    WINDOW_COVERING = 0,
    WEATHER_STATION = 1,
}

export class AccessoryFactory {

    private readonly log: Logging;
    private readonly config: PlatformConfig;
    private readonly hap: HAP;

    constructor(platform: Platform) {
        Accessory = platform.api.platformAccessory;

        this.log = platform.log;
        this.config = platform.config;
        this.hap = platform.api.hap;
    }

    createWeatherStationAccessory(): PlatformAccessory {
        const name = this.config.names.weather;
        const uuid = this.hap.uuid.generate(`${PLUGIN_IDENTIFIER}/weather-station`);
        const accessory = new Accessory(name, uuid, Categories.OTHER);

        accessory.context.type = AccessoryType.WEATHER_STATION;

        accessory.addService(this.hap.Service.LightSensor, this.config.names.light);
        accessory.addService(this.hap.Service.HumiditySensor, this.config.names.humidity);
        accessory.addService(this.hap.Service.TemperatureSensor, this.config.names.temperature);

        return accessory;
    }

    createWindowCoveringAccessory(blind: Blind): PlatformAccessory {
        const uuid = this.hap.uuid.generate(`${PLUGIN_IDENTIFIER}/blinds/${blind.key}`);
        const accessory = new Accessory(blind.name, uuid, Categories.WINDOW_COVERING);

        accessory.context.type = AccessoryType.WINDOW_COVERING;
        accessory.context.key = blind.key;

        accessory.addService(this.hap.Service.WindowCovering);

        return accessory;
    }
}
