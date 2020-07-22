import { API, APIEvent, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, } from 'homebridge';
import { AccessoryFactory } from './accessory';
import { Client } from './api';
import { BridgeFactory, BridgeInterface } from './bridge';

export const PLUGIN_IDENTIFIER = "my-gekko";
export const PLATFORM_NAME = "myGEKKO";

export class Platform implements DynamicPlatformPlugin {

    private _accessoryFactory?: AccessoryFactory;
    private _bridgeFactory?: BridgeFactory;
    private _client?: Client;

    private bridges: BridgeInterface[] = [];

    constructor(public readonly log: Logging, public readonly config: PlatformConfig, public readonly api: API) {
        if (this.config.host === undefined || this.config.username === undefined || this.config.password === undefined) {
            this.log.error('Platform config missing - please check the config file');
            return;
        }

        this.log('Platform finished initializing');

        /*
         * When this event is fired, Homebridge restored all cached accessories from disk and did call their respective
         * `configureAccessory` method for all of them. Dynamic Platform plugins should only activate new accessories
         * after this event was fired, in order to ensure they weren't added to Homebridge already.
         * This event can also be used to start discovery of new accessories.
         */
        this.api.on(APIEvent.DID_FINISH_LAUNCHING, this.onFinishedLaunching.bind(this));
    }

    get accessoryFactory(): AccessoryFactory {
        if (this._accessoryFactory === undefined) {
            this._accessoryFactory = new AccessoryFactory(this);
        }

        return this._accessoryFactory;
    }

    get bridgeFactory(): BridgeFactory {
        if (this._bridgeFactory === undefined) {
            this._bridgeFactory = new BridgeFactory(this);
        }

        return this._bridgeFactory;
    }

    get client(): Client {
        if (this._client === undefined) {
            this._client = new Client({
                host: this.config.host,
                username: this.config.username,
                password: this.config.password,
                ttl: this.config.ttl
            });
        }

        return this._client;
    }

    get accessories(): PlatformAccessory[] {
        return this.bridges.map((bridge) => bridge.accessory);
    }

    onFinishedLaunching(): void {
        this.log('Platform finished launching');

        this.config.debug && this.removeAccessories();

        this.discoverAccessories()
            .then((accessories: PlatformAccessory[]) => {
                this.addAccessories(accessories);
            })
            .catch(this.log.error);
    }

    discoverAccessories(): Promise<PlatformAccessory[]> {
        this.log('Discovering accessories');

        return Promise
            .all([
                this.discoverTemperatureSensorAccessories(),
                this.discoverWindowCoveringAccessories()
            ])
            .then((list) => {
                return list.reduce((previous, current) => previous.concat(current), [])
            });
    }

    discoverTemperatureSensorAccessories(): Promise<PlatformAccessory[]> {
        return this.client.getMeteo()
            .then((meteo) => {
                const accessories = [];
                if (meteo !== undefined) {
                    accessories.push(this.accessoryFactory.createTemperatureSensorAccessory(meteo));
                }

                return accessories;
            });
    }

    discoverWindowCoveringAccessories(): Promise<PlatformAccessory[]> {
        return this.client.getBlinds()
            .then((blinds) => blinds.map((blind) => {
                return this.accessoryFactory.createWindowCoveringAccessory(blind);
            }));
    }

    /**
     * Configure and activate accessories
     *
     * @param accessories
     */
    addAccessories(accessories: PlatformAccessory[]): void {
        accessories = accessories.filter((accessory) => {
            return undefined === this.accessories.find((predicate) => accessory.UUID === predicate.UUID)
        });

        accessories = accessories.map((accessory) => {
            this.log('Adding accessory %s', accessory.displayName);

            this.configureAccessory(accessory);
            return accessory;
        });

        this.api.registerPlatformAccessories(PLUGIN_IDENTIFIER, PLATFORM_NAME, accessories);
    }

    /**
     * This method is called for every PlatformAccessory, which is recreated from disk on startup.
     * It should be used to properly initialize the Accessory and setup all event handlers for
     * all services and their characteristics.
     *
     * @param {PlatformAccessory} accessory which needs to be configured
     */
    configureAccessory(accessory: PlatformAccessory): void {
        let bridge;

        try {
            bridge = this.bridgeFactory.createBridge(accessory);
        } catch (error) {
            this.log.error(error);
            return;
        }

        bridge.activate()
            .catch(this.log.error);

        this.bridges.push(bridge);
    }

    removeAccessories() {
        this.log('Removing accessories');

        this.bridges.forEach((bridge) => bridge.arrest());
        this.api.unregisterPlatformAccessories(PLUGIN_IDENTIFIER, PLATFORM_NAME, this.accessories);
        this.bridges.splice(0, this.bridges.length); // clear out the array
    }
}
