import {
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    HAP,
    Logging,
    PlatformAccessory,
    PlatformConfig,
    Service
} from 'homebridge';
import { Client, Meteo } from '../api';
import { Platform } from '../platform';
import { DeviceInterface } from './device-interface';

export class WeatherStation implements DeviceInterface {

    private readonly client: Client;
    private readonly log: Logging;
    private readonly config: PlatformConfig;
    private readonly hap: HAP;

    constructor(platform: Platform, public readonly accessory: PlatformAccessory) {
        this.client = platform.client;
        this.log = platform.log;
        this.config = platform.config;
        this.hap = platform.api.hap;
    }

    getMeteo(): Promise<Meteo> {
        return new Promise(async (resolve, reject) => {
            const meteo = await this.client.getMeteo();
            if (meteo === undefined) {
                reject(new Error(`Meteo not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(meteo);
        });
    }

    getLightSensorService(): Promise<Service> {
        return new Promise((resolve, reject) => {
            const service = this.accessory.getService(this.hap.Service.LightSensor);
            if (service === undefined) {
                reject(new Error(`Light sensor service not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(service);
        });
    }

    getHumiditySensorService(): Promise<Service> {
        return new Promise((resolve, reject) => {
            const service = this.accessory.getService(this.hap.Service.HumiditySensor);
            if (service === undefined) {
                reject(new Error(`Humidity sensor service not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(service);
        });
    }

    getTemperatureSensorService(): Promise<Service> {
        return new Promise((resolve, reject) => {
            const service = this.accessory.getService(this.hap.Service.TemperatureSensor);
            if (service === undefined) {
                reject(new Error(`Temperature sensor service not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(service);
        });
    }

    async updateName(): Promise<void> {
        const lightSensor = await this.getLightSensorService();
        const humiditySensor = await this.getHumiditySensorService();
        const temperatureSensor = await this.getTemperatureSensorService();

        this.accessory.displayName = this.config.names?.weather ?? 'Weather';

        lightSensor.updateCharacteristic(this.hap.Characteristic.Name, this.config.names?.light ?? 'Light');
        humiditySensor.updateCharacteristic(this.hap.Characteristic.Name, this.config.names?.humidity ?? 'Humidity');
        temperatureSensor.updateCharacteristic(this.hap.Characteristic.Name, this.config.names?.temperature ?? 'Temperature');
    }

    async getCurrentAmbientLightLevel(): Promise<number> {
        const service = await this.getHumiditySensorService();
        const characteristic = service.getCharacteristic(this.hap.Characteristic.CurrentAmbientLightLevel);

        return characteristic.value as number;
    }

    async updateCurrentAmbientLightLevel(): Promise<void> {
        const meteo = await this.getMeteo();
        const twilight = await meteo.getTwilight();
        const service = await this.getHumiditySensorService();

        service.updateCharacteristic(this.hap.Characteristic.CurrentAmbientLightLevel, twilight);
    }

    async getCurrentRelativeHumidity(): Promise<number> {
        const service = await this.getHumiditySensorService();
        const characteristic = service.getCharacteristic(this.hap.Characteristic.CurrentRelativeHumidity);

        return characteristic.value as number;
    }

    async updateCurrentRelativeHumidity(): Promise<void> {
        const meteo = await this.getMeteo();
        const humidity = await meteo.getHumidity();
        const service = await this.getHumiditySensorService();

        service.updateCharacteristic(this.hap.Characteristic.CurrentRelativeHumidity, humidity);
    }

    async getCurrentTemperature(): Promise<number> {
        const service = await this.getTemperatureSensorService();
        const characteristic = service.getCharacteristic(this.hap.Characteristic.CurrentTemperature);

        return characteristic.value as number;
    }

    async updateCurrentTemperature(): Promise<void> {
        const meteo = await this.getMeteo();
        const temperature = await meteo.getTemperature();
        const service = await this.getTemperatureSensorService();

        service.updateCharacteristic(this.hap.Characteristic.CurrentTemperature, temperature);
    }

    async update(): Promise<void> {
        this.log('Updating weather station %s', this.accessory.displayName);

        await this.updateName();
        await this.updateCurrentAmbientLightLevel();
        await this.updateCurrentRelativeHumidity();
        await this.updateCurrentTemperature();
    }

    async activate(): Promise<void> {
        this.log('Activating weather station %s', this.accessory.displayName);

        const lightSensor = await this.getLightSensorService();
        const humiditySensor = await this.getHumiditySensorService();
        const temperatureSensor = await this.getTemperatureSensorService();

        lightSensor.getCharacteristic(this.hap.Characteristic.CurrentAmbientLightLevel)
            .on(CharacteristicEventTypes.GET, this.onCurrentAmbientLightLevel.bind(this));

        humiditySensor.getCharacteristic(this.hap.Characteristic.CurrentRelativeHumidity)
            .on(CharacteristicEventTypes.GET, this.onGetCurrentRelativeHumidity.bind(this));

        temperatureSensor.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
            .on(CharacteristicEventTypes.GET, this.onGetCurrentTemperature.bind(this));
    }

    async arrest(): Promise<void> {
        this.log('Arresting weather station %s', this.accessory.displayName);
    }

    onCurrentAmbientLightLevel(callback: CharacteristicGetCallback): void {
        this.config.debug && this.log('Getting current ambient light level of weather station %s', this.accessory.displayName);

        this.getCurrentAmbientLightLevel()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);

        this.updateCurrentAmbientLightLevel()
            .catch(callback);
    }

    onGetCurrentRelativeHumidity(callback: CharacteristicGetCallback): void {
        this.config.debug && this.log('Getting current relative humidity of weather station %s', this.accessory.displayName);

        this.getCurrentRelativeHumidity()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);

        this.updateCurrentRelativeHumidity()
            .catch(callback);
    }

    onGetCurrentTemperature(callback: CharacteristicGetCallback): void {
        this.config.debug && this.log('Getting current temperature of weather station %s', this.accessory.displayName);

        this.getCurrentTemperature()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);

        this.updateCurrentTemperature()
            .catch(callback);
    }
}
