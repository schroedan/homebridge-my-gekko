import { CharacteristicEventTypes, CharacteristicGetCallback, PlatformAccessory, Service } from 'homebridge';
import { Meteo } from '../api';
import { Platform } from '../platform';
import { BridgeInterface } from './bridge-interface';
import Timeout = NodeJS.Timeout;

export class TemperatureSensor implements BridgeInterface {

    private _watcher?: Timeout;

    constructor(private readonly platform: Platform, public readonly accessory: PlatformAccessory) {
    }

    getMeteo(): Promise<Meteo> {
        return new Promise(async (resolve, reject) => {
            const meteo = await this.platform.client.getMeteo();
            if (meteo === undefined) {
                reject(new Error(`Meteo not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(meteo);
        });
    }

    getService(): Promise<Service> {
        return new Promise((resolve, reject) => {
            const service = this.accessory.getService(this.platform.api.hap.Service.TemperatureSensor);
            if (service === undefined) {
                reject(new Error(`Temperature sensor service not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(service);
        });
    }

    async updateName(): Promise<void> {
        const name = this.platform.config.names?.meteo?.temperature ?? 'Temperature';
        const service = await this.getService();

        this.accessory.displayName = name;

        service.updateCharacteristic(this.platform.api.hap.Characteristic.Name, this.accessory.displayName);
    }

    async getCurrentTemperature(): Promise<number> {
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentTemperature);

        return characteristic.value as number;
    }

    async updateCurrentTemperature(): Promise<void> {
        const meteo = await this.getMeteo();
        const temperature = await meteo.getTemperature();
        const service = await this.getService();

        service.updateCharacteristic(this.platform.api.hap.Characteristic.CurrentTemperature, temperature);
    }

    async update(): Promise<void> {
        this.platform.log('Updating temperature sensor %s', this.accessory.displayName);

        await this.updateName();
        await this.updateCurrentTemperature();
    }

    async activate(): Promise<void> {
        await this.arrest();
        await this.update();

        const service = await this.getService();

        service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentTemperature)
            .on(CharacteristicEventTypes.GET, this.onGetCurrentTemperature.bind(this));

        this._watcher = setInterval(this.update.bind(this), (this.platform.config.interval ?? 60) * 1000);
    }

    async arrest(): Promise<void> {
        if (this._watcher === undefined) {
            return;
        }

        clearInterval(this._watcher);
    }

    onGetCurrentTemperature(callback: CharacteristicGetCallback): void {
        this.platform.log('Getting current temperature of temperature sensor %s', this.accessory.displayName);

        this.getCurrentTemperature()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);

        this.updateCurrentTemperature()
            .catch(callback);
    }
}
