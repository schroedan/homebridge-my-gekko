import {
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    HAP,
    Logging,
    PlatformAccessory,
    PlatformConfig,
    Service
} from 'homebridge';
import { Blind, BlindState, BlindSumState, Client } from '../api';
import { Platform } from '../platform';
import { DeviceInterface } from './device-interface';
import Timeout = NodeJS.Timeout;

export class WindowCovering implements DeviceInterface {

    private _targetPositionAllocator?: Timeout;

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

    getBlind(): Promise<Blind> {
        return new Promise(async (resolve, reject) => {
            const blind = await this.client.getBlind(this.accessory.context.key);
            if (blind === undefined) {
                reject(new Error(`Blind ${this.accessory.context.key} not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(blind);
        });
    }

    getWindowCoveringService(): Promise<Service> {
        return new Promise((resolve, reject) => {
            const service = this.accessory.getService(this.hap.Service.WindowCovering);
            if (service === undefined) {
                reject(new Error(`Window covering service not found for ${this.accessory.displayName}`));
                return;
            }

            resolve(service);
        });
    }

    async updateName(): Promise<void> {
        const blind = await this.getBlind();
        const service = await this.getWindowCoveringService();

        this.accessory.displayName = blind.name;

        service.updateCharacteristic(this.hap.Characteristic.Name, this.accessory.displayName);
    }

    async getCurrentPosition(): Promise<number> {
        const service = await this.getWindowCoveringService();
        const characteristic = service.getCharacteristic(this.hap.Characteristic.CurrentPosition);

        return characteristic.value as number;
    }

    async updateCurrentPosition(): Promise<void> {
        const blind = await this.getBlind();
        const position = await blind.getPosition();
        const service = await this.getWindowCoveringService();

        service.updateCharacteristic(this.hap.Characteristic.CurrentPosition, Math.round(100 - position));
    }

    async getTargetPosition(): Promise<number> {
        const service = await this.getWindowCoveringService();
        const characteristic = service.getCharacteristic(this.hap.Characteristic.TargetPosition);

        return characteristic.value as number;
    }

    async applyTargetPosition(value: number): Promise<void> {
        const blind = await this.getBlind();
        const service = await this.getWindowCoveringService();

        service.updateCharacteristic(this.hap.Characteristic.TargetPosition, value);

        await blind.setPosition(100 - value);
    }

    async getPositionState(): Promise<number> {
        const service = await this.getWindowCoveringService();
        const characteristic = service.getCharacteristic(this.hap.Characteristic.PositionState);

        return characteristic.value as number;
    }

    async updatePositionState(): Promise<void> {
        const blind = await this.getBlind();
        const state = await blind.getState();
        const service = await this.getWindowCoveringService();

        switch (state) {
            case BlindState.HOLD_DOWN:
            case BlindState.DOWN:
                service.updateCharacteristic(this.hap.Characteristic.PositionState, this.hap.Characteristic.PositionState.DECREASING);
                break;
            case BlindState.HOLD_UP:
            case BlindState.UP:
                service.updateCharacteristic(this.hap.Characteristic.PositionState, this.hap.Characteristic.PositionState.INCREASING);
                break;
            default:
                service.updateCharacteristic(this.hap.Characteristic.PositionState, this.hap.Characteristic.PositionState.STOPPED);
        }
    }

    async updateObstructionDetected(): Promise<void> {
        const blind = await this.getBlind();
        const sumState = await blind.getSumState();
        const service = await this.getWindowCoveringService();

        service.updateCharacteristic(this.hap.Characteristic.ObstructionDetected, sumState !== BlindSumState.OK);
    }

    async update(): Promise<void> {
        this.log('Updating window covering %s', this.accessory.displayName);

        await this.updateName();
        await this.updateCurrentPosition();
        await this.updatePositionState();
        await this.updateObstructionDetected();
    }

    async activate(): Promise<void> {
        this.log('Activating window covering %s', this.accessory.displayName);

        const service = await this.getWindowCoveringService();
        const position = await this.getCurrentPosition();

        service.updateCharacteristic(this.hap.Characteristic.TargetPosition, position);

        service.getCharacteristic(this.hap.Characteristic.CurrentPosition)
            .on(CharacteristicEventTypes.GET, this.onGetCurrentPosition.bind(this));

        service.getCharacteristic(this.hap.Characteristic.TargetPosition)
            .on(CharacteristicEventTypes.GET, this.onGetTargetPosition.bind(this))
            .on(CharacteristicEventTypes.SET, this.onSetTargetPosition.bind(this));

        service.getCharacteristic(this.hap.Characteristic.PositionState)
            .on(CharacteristicEventTypes.GET, this.onGetPositionState.bind(this));
    }

    async arrest(): Promise<void> {
        this.log('Arresting window covering %s', this.accessory.displayName);

        if (this._targetPositionAllocator !== undefined) {
            clearTimeout(this._targetPositionAllocator);
        }
    }

    onGetCurrentPosition(callback: CharacteristicGetCallback): void {
        this.config.debug && this.log('Getting current position of window covering %s', this.accessory.displayName);

        this.getCurrentPosition()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);

        this.updateCurrentPosition()
            .catch(callback);
    }

    onGetTargetPosition(callback: CharacteristicGetCallback): void {
        this.config.debug && this.log('Getting target position of window covering %s', this.accessory.displayName);

        this.getTargetPosition()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);
    }

    onSetTargetPosition(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.config.debug && this.log('Setting target position of window covering %s to %s', this.accessory.displayName, value);

        if (this._targetPositionAllocator !== undefined) {
            clearTimeout(this._targetPositionAllocator);
        }

        this._targetPositionAllocator = setTimeout(() => {
            this._targetPositionAllocator = undefined;
            this.applyTargetPosition(value as number)
                .catch(callback)
        }, this.config.delay ?? 500);

        this._targetPositionAllocator.unref(); // unblock

        callback();
    }

    onGetPositionState(callback: CharacteristicGetCallback): void {
        this.config.debug && this.log('Getting position state of window covering %s', this.accessory.displayName);

        this.getPositionState()
            .then((value) => {
                callback(null, value);
            })
            .catch(callback);

        this.updatePositionState()
            .catch(callback);
    }
}
