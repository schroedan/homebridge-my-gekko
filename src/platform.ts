import {
    API,
    APIEvent,
    Categories,
    DynamicPlatformPlugin,
    Logging,
    PlatformAccessory,
    PlatformConfig,
} from 'homebridge';
import { AccessoryFactory, WindowCoveringController } from './accessory';
import { Client } from './api';
import Timeout = NodeJS.Timeout;

export const PLUGIN_IDENTIFIER = "my-gekko";
export const PLATFORM_NAME = "myGEKKO";

export class Platform implements DynamicPlatformPlugin {

    private _accessoryFactory?: AccessoryFactory;
    private _client?: Client;

    private readonly watchers: Timeout[] = [];
    private readonly accessories: PlatformAccessory[] = [];

    constructor(public readonly log: Logging, public readonly config: PlatformConfig, public readonly api: API) {
        if (this.config.host === undefined || this.config.username === undefined || this.config.password === undefined) {
            this.log.error('Platform config missing - please check the config file');
            return;
        }

        this.log('Platform finished initializing');

        /*
         * When this event is fired, Homebridge restored all cached accessories from disk and did call their respective
         * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
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
                this.discoverWindowCoveringAccessories()
            ])
            .then((list) => {
                return list.reduce((previous, current) => previous.concat(current), [])
            });
    }

    discoverWindowCoveringAccessories(): Promise<PlatformAccessory[]> {
        return this.client.getBlinds()
            .then((blinds) => blinds.map((blind) => {
                return this.accessoryFactory.createWindowCoveringAccessory(blind);
            }));
    }

    /**
     * Configure and register accessories
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
     * This function is invoked when Homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): void {
        switch (accessory.category) {
            case Categories.WINDOW_COVERING:
                this.configureWindowCoveringAccessory(accessory);
                break;
        }

        this.accessories.push(accessory);
    }

    configureWindowCoveringAccessory(accessory: PlatformAccessory): void {
        const controller = new WindowCoveringController(this, accessory);

        controller.register()
            .then((watcher) => {
                this.watchers.push(watcher);
            })
            .catch(this.log.error);
    }

    removeAccessories() {
        this.log('Removing accessories');

        this.watchers.forEach(clearInterval);
        this.watchers.splice(0, this.watchers.length); // clear out the array

        this.api.unregisterPlatformAccessories(PLUGIN_IDENTIFIER, PLATFORM_NAME, this.accessories);
        this.accessories.splice(0, this.accessories.length); // clear out the array
    }
}
