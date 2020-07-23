import { PlatformAccessory } from 'homebridge';

export interface DeviceInterface {

    readonly accessory: PlatformAccessory;

    update(): Promise<void>;

    activate(): Promise<void>;

    arrest(): Promise<void>;
}
