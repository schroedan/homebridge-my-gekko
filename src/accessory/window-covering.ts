import {
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    PlatformAccessory,
    Service
} from 'homebridge';
import { Blind, BlindState, BlindSumState } from '../api';
import { Platform } from '../platform';
import Timeout = NodeJS.Timeout;

export class WindowCovering {

    private _updateWatcher?: Timeout;
    private _positionAllocator?: Timeout;

    constructor(private readonly platform: Platform, private readonly accessory: PlatformAccessory) {
    }

    get updateWatcher(): Timeout | undefined {
        return this._updateWatcher;
    }

    getBlind(): Promise<Blind> {
        return new Promise(async (resolve, reject) => {
            const blind = await this.platform.client.getBlind(this.accessory.context.key);
            if (blind === undefined) {
                reject(new Error(`Blind ${this.accessory.context.key} not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(blind);
        });
    }

    getService(): Promise<Service> {
        return new Promise((resolve, reject) => {
            const service = this.accessory.getService(this.platform.api.hap.Service.WindowCovering);
            if (service === undefined) {
                reject(new Error(`Window covering service not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(service);
        });
    }

    async updateDisplayName(): Promise<void> {
        const blind = await this.getBlind();
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.Name);

        this.accessory.displayName = blind.name;

        characteristic.updateValue(this.accessory.displayName);
    }

    async getCurrentPosition(): Promise<number> {
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentPosition);

        return characteristic.value as number;
    }

    async updateCurrentPosition(): Promise<void> {
        const blind = await this.getBlind();
        const position = await blind.getPosition();
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentPosition);

        characteristic.updateValue(Math.round(100 - position));
    }

    async getTargetPosition(): Promise<number> {
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.TargetPosition);

        return characteristic.value as number;
    }

    async applyTargetPosition(value: number): Promise<void> {
        const blind = await this.getBlind();
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.TargetPosition);

        characteristic.updateValue(value);

        await blind.setPosition(100 - (characteristic.value as number));
    }

    async getPositionState(): Promise<number> {
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.PositionState);

        return characteristic.value as number;
    }

    async updatePositionState(): Promise<void> {
        const blind = await this.getBlind();
        const state = await blind.getState();
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.PositionState);

        switch (state) {
            case BlindState.HOLD_DOWN:
            case BlindState.DOWN:
                characteristic.updateValue(this.platform.api.hap.Characteristic.PositionState.DECREASING);
                break;
            case BlindState.HOLD_UP:
            case BlindState.UP:
                characteristic.updateValue(this.platform.api.hap.Characteristic.PositionState.INCREASING);
                break;
            default:
                characteristic.updateValue(this.platform.api.hap.Characteristic.PositionState.STOPPED);
        }
    }

    async updateObstructionDetected(): Promise<void> {
        const blind = await this.getBlind();
        const sumState = await blind.getSumState();
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.ObstructionDetected);

        characteristic.updateValue(sumState !== BlindSumState.OK);
    }

    async update(): Promise<void> {
        this.platform.log('Updating window covering %s', this.accessory.displayName);

        await this.updateDisplayName();
        await this.updateCurrentPosition();
        await this.updatePositionState();
        await this.updateObstructionDetected();
    }

    async configure(): Promise<void> {
        this.platform.log('Configuring window covering %s', this.accessory.displayName);

        await this.update();

        const service = await this.getService();

        service.getCharacteristic(this.platform.api.hap.Characteristic.TargetPosition)
            .setValue(await this.getCurrentPosition());

        service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentPosition)
            .on(CharacteristicEventTypes.GET, this.onGetCurrentPosition.bind(this));

        service.getCharacteristic(this.platform.api.hap.Characteristic.TargetPosition)
            .on(CharacteristicEventTypes.GET, this.onGetTargetPosition.bind(this))
            .on(CharacteristicEventTypes.SET, this.onSetTargetPosition.bind(this));

        service.getCharacteristic(this.platform.api.hap.Characteristic.PositionState)
            .on(CharacteristicEventTypes.GET, this.onGetPositionState.bind(this));

        if (this._updateWatcher !== undefined) {
            clearInterval(this._updateWatcher);
        }

        this._updateWatcher = setInterval(this.update.bind(this), this.platform.config.interval ?? 10000);
    }

    onGetCurrentPosition(callback: CharacteristicGetCallback): void {
        this.platform.log('Getting current position of window covering %s', this.accessory.displayName);

        this.getCurrentPosition()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);

        this.updateCurrentPosition()
            .catch(callback);
    }

    onGetTargetPosition(callback: CharacteristicGetCallback): void {
        this.platform.log('Getting target position of window covering %s', this.accessory.displayName);

        this.getTargetPosition()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);
    }

    onSetTargetPosition(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.platform.log('Setting target position of window covering %s to %s', this.accessory.displayName, value);

        if (this._positionAllocator !== undefined) {
            clearTimeout(this._positionAllocator);
        }

        this._positionAllocator = setTimeout(() => {
            this.applyTargetPosition(value as number).catch(callback);
        }, this.platform.config.delay ?? 300);

        callback();
    }

    onGetPositionState(callback: CharacteristicGetCallback): void {
        this.platform.log('Getting position state of window covering %s', this.accessory.displayName);

        this.getPositionState()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);

        this.updatePositionState()
            .catch(callback);
    }
}
