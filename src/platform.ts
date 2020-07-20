import {
    API,
    APIEvent,
    Categories,
    DynamicPlatformPlugin,
    Logging,
    PlatformAccessory,
    PlatformAccessoryEvent,
    PlatformConfig,
} from 'homebridge';
import { WindowCovering } from './accessory';
import { Client } from './api';
import Timeout = NodeJS.Timeout;

export const PLUGIN_IDENTIFIER = "my-gekko";
export const PLATFORM_NAME = "myGEKKO";

export class Platform implements DynamicPlatformPlugin {

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

        if (this.config.reset) {
            this.removeAccessories();
        }

        this.discoverAccessories()
            .then((accessories: PlatformAccessory[]) => {
                this.addAccessories(this.filterConfiguredAccessories(accessories));
            })
            .catch(this.log.error);
    }

    discoverAccessories(): Promise<PlatformAccessory[]> {
        this.log('Discovering accessories');

        return Promise
            .all([
                this.discoverWindowCoveringAccessories()
            ])
            .then((accessoriesList) => {
                return accessoriesList.reduce((previousAccessories, currentAccessories) => previousAccessories.concat(currentAccessories), [])
            });
    }

    discoverWindowCoveringAccessories(): Promise<PlatformAccessory[]> {
        return this.client.getBlinds()
            .then((blinds) => blinds.map((blind) => {
                const uuid = this.api.hap.uuid.generate(`my-gekko/blinds/${blind.key}`);
                const accessory = new (this.api.platformAccessory)(blind.name, uuid, Categories.WINDOW_COVERING);

                accessory.addService(this.api.hap.Service.WindowCovering);
                accessory.context.key = blind.key;

                return accessory;
            }));
    }

    filterConfiguredAccessories(accessories: PlatformAccessory[]): PlatformAccessory[] {
        return accessories.filter((accessory) => undefined === this.accessories.find((predicate) => accessory.UUID === predicate.UUID));
    }

    /**
     * Configure and register accessories
     *
     * @param accessories
     */
    addAccessories(accessories: PlatformAccessory[]): void {
        this.api.registerPlatformAccessories(PLUGIN_IDENTIFIER, PLATFORM_NAME, accessories.map((accessory) => {
            this.log('Adding accessory %s', accessory.displayName);

            this.configureAccessory(accessory);
            return accessory;
        }));
    }

    /**
     * This function is invoked when Homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): void {
        accessory.on(PlatformAccessoryEvent.IDENTIFY, () => {
            this.log('Accessory %s identified', accessory.displayName);
        });

        switch (accessory.category) {
            case Categories.WINDOW_COVERING:
                const windowCovering = new WindowCovering(this, accessory);
                windowCovering.configure().catch(this.log.error);
                if (windowCovering.updateWatcher !== undefined) {
                    this.watchers.push(windowCovering.updateWatcher);
                }
                break;
        }

        this.accessories.push(accessory);
    }

    removeAccessories() {
        this.log('Removing accessories');

        this.watchers.forEach(clearInterval);
        this.watchers.splice(0, this.watchers.length); // clear out the array

        this.api.unregisterPlatformAccessories(PLUGIN_IDENTIFIER, PLATFORM_NAME, this.accessories);
        this.accessories.splice(0, this.accessories.length); // clear out the array
    }
}
