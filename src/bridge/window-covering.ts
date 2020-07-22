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
import { BridgeInterface } from './bridge-interface';
import Timeout = NodeJS.Timeout;

export class WindowCovering implements BridgeInterface {

    private _watcher?: Timeout;
    private _targetPositionAllocator?: Timeout;

    constructor(private readonly platform: Platform, public readonly accessory: PlatformAccessory) {
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

    async updateName(): Promise<void> {
        const blind = await this.getBlind();
        const service = await this.getService();

        this.accessory.displayName = blind.name;

        service.updateCharacteristic(this.platform.api.hap.Characteristic.Name, this.accessory.displayName);
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

        service.updateCharacteristic(this.platform.api.hap.Characteristic.CurrentPosition, Math.round(100 - position));
    }

    async getTargetPosition(): Promise<number> {
        const service = await this.getService();
        const characteristic = service.getCharacteristic(this.platform.api.hap.Characteristic.TargetPosition);

        return characteristic.value as number;
    }

    async applyTargetPosition(value: number): Promise<void> {
        const blind = await this.getBlind();
        const service = await this.getService();

        service.updateCharacteristic(this.platform.api.hap.Characteristic.TargetPosition, value);

        await blind.setPosition(100 - value);
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

        switch (state) {
            case BlindState.HOLD_DOWN:
            case BlindState.DOWN:
                service.updateCharacteristic(this.platform.api.hap.Characteristic.PositionState, this.platform.api.hap.Characteristic.PositionState.DECREASING);
                break;
            case BlindState.HOLD_UP:
            case BlindState.UP:
                service.updateCharacteristic(this.platform.api.hap.Characteristic.PositionState, this.platform.api.hap.Characteristic.PositionState.INCREASING);
                break;
            default:
                service.updateCharacteristic(this.platform.api.hap.Characteristic.PositionState, this.platform.api.hap.Characteristic.PositionState.STOPPED);
        }
    }

    async updateObstructionDetected(): Promise<void> {
        const blind = await this.getBlind();
        const sumState = await blind.getSumState();
        const service = await this.getService();

        service.updateCharacteristic(this.platform.api.hap.Characteristic.ObstructionDetected, sumState !== BlindSumState.OK);
    }

    async update(): Promise<void> {
        this.platform.log('Updating window covering %s', this.accessory.displayName);

        await this.updateName();
        await this.updateCurrentPosition();
        await this.updatePositionState();
        await this.updateObstructionDetected();
    }

    async activate(): Promise<void> {
        await this.arrest();
        await this.update();

        const service = await this.getService();
        const position = await this.getCurrentPosition();

        service.updateCharacteristic(this.platform.api.hap.Characteristic.TargetPosition, position);

        service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentPosition)
            .on(CharacteristicEventTypes.GET, this.onGetCurrentPosition.bind(this));

        service.getCharacteristic(this.platform.api.hap.Characteristic.TargetPosition)
            .on(CharacteristicEventTypes.GET, this.onGetTargetPosition.bind(this))
            .on(CharacteristicEventTypes.SET, this.onSetTargetPosition.bind(this));

        service.getCharacteristic(this.platform.api.hap.Characteristic.PositionState)
            .on(CharacteristicEventTypes.GET, this.onGetPositionState.bind(this));

        this._watcher = setInterval(this.update.bind(this), (this.platform.config.interval ?? 60) * 1000);
    }

    async arrest(): Promise<void> {
        if (this._watcher === undefined) {
            return;
        }

        clearInterval(this._watcher);
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

        if (this._targetPositionAllocator !== undefined) {
            clearTimeout(this._targetPositionAllocator);
        }

        this._targetPositionAllocator = setTimeout(() => {
            this._targetPositionAllocator = undefined;
            this.applyTargetPosition(value as number)
                .catch(callback)
        }, this.platform.config.delay ?? 500);

        this._targetPositionAllocator.unref(); // unblock

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
