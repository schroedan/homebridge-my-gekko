import {
    API,
    APIEvent,
    Categories,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    DynamicPlatformPlugin,
    HAP,
    Logging,
    PlatformAccessory,
    PlatformAccessoryEvent,
    PlatformConfig,
    Service,
} from 'homebridge';
import { Client } from './client';

const PLUGIN_NAME = "my-gekko-platform";
const PLATFORM_NAME = "MyGekkoPlatform";

let hap: HAP;
let Accessory: typeof PlatformAccessory;

export = (api: API) => {
    hap = api.hap;
    Accessory = api.platformAccessory;

    api.registerPlatform(PLATFORM_NAME, Platform);
};

class Platform implements DynamicPlatformPlugin {

    private readonly log: Logging;
    private readonly config: PlatformConfig;
    private readonly api: API;
    private readonly client?: Client;
    private readonly accessories: PlatformAccessory[] = [];

    constructor(log: Logging, config: PlatformConfig, api: API) {
        this.log = log;
        this.config = config;
        this.api = api;

        if (this.config.host === undefined || this.config.username === undefined || this.config.password === undefined) {
            this.log.error('myGEKKO platform config missing. Check the config.json file.');
            return;
        }

        this.client = new Client(config.host, config.username, config.password);

        this.log.debug('myGEKKO platform finished initializing.');

        /*
         * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
         * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
         * after this event was fired, in order to ensure they weren't added to homebridge already.
         * This event can also be used to start discovery of new accessories.
         */
        this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
            this.log.debug('myGEKKO platform finished launching.');

            this.addAccessories()
                .catch(this.log.error);
        });
    }

    addAccessories(): Promise<void> {
        return Promise
            .all([
                this.discoverWindowCoveringAccessories()
            ])
            .then((accessoriesList) => {
                const accessories = accessoriesList
                    .reduce((accumulator, values) => accumulator.concat(values), [])
                    .filter((accessory) => undefined === this.accessories.find((predicate) => {
                        if (accessory.UUID === predicate.UUID) {
                            this.log.debug('Accessory %s already registered, skipping.', accessory.displayName);
                            return true;
                        }

                        return false;
                    }))
                    .map((accessory) => {
                        this.configureAccessory(accessory);
                        return accessory;
                    })

                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, accessories);
            });
    }

    discoverWindowCoveringAccessories(): Promise<PlatformAccessory[]> {
        return this.client!.getBlinds()
            .then((blinds) => blinds.map((blind) => {
                const uuid = hap.uuid.generate(blind.name);
                const accessory = new Accessory(blind.name, uuid, Categories.WINDOW_COVERING);

                accessory.addService(hap.Service.WindowCovering);
                accessory.context = {
                    key: blind.key,
                    data: blind.data,
                };

                return accessory;
            }));
    }

    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): void {
        this.log.debug('Configuring accessory %s.', accessory.displayName);

        accessory.on(PlatformAccessoryEvent.IDENTIFY, () => {
            this.log.debug('%s identified.', accessory.displayName);
        });

        switch (accessory.category) {
            case Categories.WINDOW_COVERING:
                this.configureWindowCoveringAccessory(accessory);
                break;
        }

        this.accessories.push(accessory);
    }

    configureWindowCoveringAccessory(accessory: PlatformAccessory): void {
        const windowCoveringService = accessory.getService(hap.Service.WindowCovering);

        if (windowCoveringService === undefined) {
            return;
        }

        this.configureWindowCoveringCharacteristics(windowCoveringService, accessory.context);
    }

    configureWindowCoveringCharacteristics(service: Service, context: any): void {
        //const blind = new Blind(this.client, context.key, context.data);

        service.getCharacteristic(hap.Characteristic.CurrentPosition)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.debug('WindowCovering::GetCurrentPosition');

                callback(null, 1);

                /*
                blind.getPosition()
                    .then((position) => {
                        callback(null, Math.round(position));
                    })
                    .catch((error) => {
                        callback(error);
                    });
                */
            });

        service.getCharacteristic(hap.Characteristic.TargetPosition)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.debug('WindowCovering::GetTargetPosition %s', context.targetPosition);

                callback(null, 1);

                //callback(null, context.targetPosition);
            })
            .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
                this.log.debug("WindowCovering::SetTargetPosition %s", value);

                context.targetPosition = value;

                callback(null);

                /*
                blind.setPosition(value as number)
                    .then(() => {
                        callback(null);
                    })
                    .catch((error) => {
                        callback(error);
                    });
                */
            });

        service.getCharacteristic(hap.Characteristic.PositionState)
            .updateValue(hap.Characteristic.PositionState.STOPPED);

        service.getCharacteristic(hap.Characteristic.ObstructionDetected)
            .updateValue(false);
    }

    /*
    unregisterAccessories() {
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessories);
        this.accessories.splice(0, this.accessories.length); // clear out the array
    }
    */
}
