import { Categories, PlatformAccessory } from 'homebridge';
import { Platform } from '../platform';
import { BridgeInterface } from './bridge-interface';
import { TemperatureSensor } from './temperature-sensor';
import { WindowCovering } from './window-covering';

export class BridgeFactory {

    constructor(private readonly platform: Platform) {
    }

    createBridge(accessory: PlatformAccessory): BridgeInterface {
        switch (accessory.category) {
            case Categories.WINDOW_COVERING:
                return new WindowCovering(this.platform, accessory);
            case Categories.OTHER:
                if (accessory.context.temperatureSensor) {
                    return new TemperatureSensor(this.platform, accessory);
                }
        }

        throw new Error(`Unable to create bridge for ${accessory.displayName}`);
    }
}
