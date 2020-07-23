import {
    API,
    APIEvent,
    Categories,
    DynamicPlatformPlugin,
    Logging,
    PlatformAccessory,
    PlatformConfig
} from 'homebridge';
import { AccessoryFactory, AccessoryType } from './accessory-factory';
import { Client } from './api';
import { DeviceInterface, WeatherStation, WindowCovering } from './device';
import Timeout = NodeJS.Timeout;

export const PLUGIN_IDENTIFIER = "my-gekko";

export const PLATFORM_NAME = "myGEKKO";

export class Platform implements DynamicPlatformPlugin {

    private _client?: Client;
    private _watcher?: Timeout;

    private readonly factory: AccessoryFactory;
    private readonly devices: DeviceInterface[] = [];

    constructor(public readonly log: Logging, public readonly config: PlatformConfig, public readonly api: API) {
        this.factory = new AccessoryFactory(this);

        if (this.config.host === undefined || this.config.username === undefined || this.config.password === undefined) {
            this.log.error('Platform config missing - please check the config file');
            return;
        }

        this.log('Platform finished initializing');

        /*
         * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
         * `configureAccessory` method for all of them. Dynamic Platform plugins should only activate new accessories
         * after this event was fired, in order to ensure they weren't added to homebridge already.
         * This event can also be used to start discovery of new accessories.
         */
        this.api.on(APIEvent.DID_FINISH_LAUNCHING, this.onFinishedLaunching.bind(this));

        /**
         * This event is fired when homebridge got shutdown. This could be a regular shutdown or a unexpected crash.
         * At this stage all Accessories are already unpublished and all PlatformAccessories are already saved to disk!
         */
        this.api.on(APIEvent.SHUTDOWN, this.onShutdown.bind(this));
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
        return this.devices.map((device) => device.accessory);
    }

    onFinishedLaunching(): void {
        this.log('Platform finished launching');

        this.config.removeDevices && this.removeDevices();

        this.discoverAccessories()
            .then((accessories: PlatformAccessory[]) => {
                this.addAccessories(accessories);
                this.updateDevices();

                if (this._watcher !== undefined) {
                    clearInterval(this._watcher);
                }
                this._watcher = setInterval(this.updateDevices.bind(this), (this.config.interval ?? 60) * 1000);
                this._watcher.unref(); // unblock
            })
            .catch(this.log.error);
    }

    onShutdown(): void {
        if (this._watcher !== undefined) {
            clearInterval(this._watcher);
        }

        this.devices.forEach((device) => device.arrest());
    }

    discoverAccessories(): Promise<PlatformAccessory[]> {
        this.log('Discovering accessories');

        return Promise
            .all([
                this.discoverWeatherStationAccessories(),
                this.discoverWindowCoveringAccessories()
            ])
            .then((list) => {
                return list.reduce((previous, current) => previous.concat(current), [])
            });
    }

    discoverWeatherStationAccessories(): Promise<PlatformAccessory[]> {
        const accessories: PlatformAccessory[] = [];

        return this.client.getMeteo()
            .then((meteo) => {
                if (meteo !== undefined) {
                    accessories.push(this.factory.createWeatherStationAccessory());
                }

                return accessories;
            });
    }

    discoverWindowCoveringAccessories(): Promise<PlatformAccessory[]> {
        return this.client.getBlinds()
            .then((blinds) => blinds.map((blind) => {
                return this.factory.createWindowCoveringAccessory(blind);
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
        const device = this.createDevice(accessory);
        if (device === undefined) {
            this.log('Removing orphaned accessory %s', accessory.displayName);

            this.api.unregisterPlatformAccessories(PLUGIN_IDENTIFIER, PLATFORM_NAME, [accessory]);
            return;
        }

        this.addDevice(device);
    }

    createDevice(accessory: PlatformAccessory): DeviceInterface | undefined {
        switch (accessory.context.type) {
            case Categories.WINDOW_COVERING:
            case AccessoryType.WINDOW_COVERING:
                return new WindowCovering(this, accessory);
            case Categories.OTHER:
            case AccessoryType.WEATHER_STATION:
                return new WeatherStation(this, accessory);
        }
    }

    addDevice(device: DeviceInterface): void {
        device.activate().catch(this.log.error);
        this.devices.push(device);
    }

    updateDevices(): void {
        this.devices.forEach((device) => device.update().catch(this.log.error));
    }

    removeDevices(): void {
        this.devices.forEach((device) => device.arrest().catch(this.log.error));
        this.api.unregisterPlatformAccessories(PLUGIN_IDENTIFIER, PLATFORM_NAME, this.accessories);
        this.devices.splice(0, this.devices.length); // clear out the array
    }
}
