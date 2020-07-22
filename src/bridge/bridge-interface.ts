import { PlatformAccessory } from 'homebridge';

export interface BridgeInterface {

    readonly accessory: PlatformAccessory;

    update(): Promise<void>;

    activate(): Promise<void>;

    arrest(): Promise<void>;
}
