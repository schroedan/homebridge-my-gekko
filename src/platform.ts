import { EventEmitter } from 'events';
import {
  API,
  APIEvent,
  Categories,
  DynamicPlatformPlugin,
  Logging,
  PlatformAccessory,
  PlatformConfig,
} from 'homebridge';
import { Container } from './container';

export const PLUGIN_IDENTIFIER = 'homebridge-my-gekko';

export const PLATFORM_NAME = 'mygekko';

export const enum PlatformEventTypes {
  /**
   * This event is fired in the configured interval.
   * At this stage all PlatformAccessories are already registered and ready!
   */
  HEARTBEAT = 'heartbeat',
  /**
   * This event is fired when homebridge got shutdown. This could be a regular shutdown or a unexpected crash.
   * At this stage all Accessories are already unpublished and all PlatformAccessories are already saved to disk!
   */
  SHUTDOWN = 'shutdown',
}

export class Platform extends EventEmitter implements DynamicPlatformPlugin {
  private _accessories: PlatformAccessory[] = [];
  private _container?: Container;

  get container(): Container {
    if (this._container === undefined) {
      this._container = new Container(this);
    }

    return this._container;
  }

  constructor(
    readonly log: Logging,
    readonly config: PlatformConfig,
    readonly api: API,
  ) {
    super();

    this.setMaxListeners(0);

    try {
      this.validateConfig();
    } catch (error) {
      this.log.error(error.message);
      return;
    }

    this.registerListeners();

    this.log.info('Platform finished initializing');
  }

  registerListeners(): void {
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.container.heartbeat.set(() => {
        this.signalHeartbeat();
      });
    });

    this.api.on(APIEvent.SHUTDOWN, () => {
      this.signalShutdown();
    });

    this.onHeartbeat(() => {
      this.discoverAccessories()
        .then((accessories) => {
          this.registerAccessories(accessories);
        })
        .catch((reason) => {
          this.log.error(reason);
        });
    });

    this.onShutdown(() => {
      this.container.heartbeat.clear();
    });
  }

  validateConfig(): void {
    if (this.config.name === undefined) {
      this.config.name = 'myGEKKO';
    }

    if (this.config.blinds === undefined) {
      this.config.blinds = true;
    }

    if (this.config.meteo === undefined) {
      this.config.meteo = true;
    }

    if (
      this.config.host === undefined ||
      this.config.username === undefined ||
      this.config.password === undefined
    ) {
      throw new Error('Platform config missing - please check the config file');
    }
  }

  signalHeartbeat(): void {
    this.emit(PlatformEventTypes.HEARTBEAT);
  }

  onHeartbeat(listener: () => void): void {
    this.setMaxListeners(this.getMaxListeners() + 1);
    this.on(PlatformEventTypes.HEARTBEAT, listener);
  }

  signalShutdown(): void {
    this.emit(PlatformEventTypes.SHUTDOWN);
  }

  onShutdown(listener: () => void): void {
    this.setMaxListeners(this.getMaxListeners() + 1);
    this.on(PlatformEventTypes.SHUTDOWN, listener);
  }

  generateUUID(accessoryIdentifier: string): string {
    return this.api.hap.uuid.generate(
      `${PLUGIN_IDENTIFIER}/${accessoryIdentifier}`,
    );
  }

  async discoverAccessories(): Promise<PlatformAccessory[]> {
    return [
      ...(this.config.blinds ? await this.discoverBlindAccessories() : []),
      ...(this.config.meteo ? await this.discoverMeteoAccessories() : []),
    ];
  }

  async discoverBlindAccessories(): Promise<PlatformAccessory[]> {
    const accessories: PlatformAccessory[] = [];
    const blinds = await this.container.queryAPI.getBlinds();

    for (const blind of blinds) {
      const accessory =
        await this.container.blindAccessoryFactory.createAccessory(blind);

      if (this.accessoryExists(accessory)) {
        continue;
      }

      this.configureAccessory(accessory);

      accessories.push(accessory);
    }

    return accessories;
  }

  async discoverMeteoAccessories(): Promise<PlatformAccessory[]> {
    const accessories: PlatformAccessory[] = [];
    const meteoAccessories = [
      await this.container.meteoTemperatureAccessoryFactory.createAccessory(),
    ];

    for (const meteoAccessory of meteoAccessories) {
      if (this.accessoryExists(meteoAccessory)) {
        continue;
      }

      this.configureAccessory(meteoAccessory);

      accessories.push(meteoAccessory);
    }

    return accessories;
  }

  registerAccessories(accessories: PlatformAccessory[]): void {
    this.api.registerPlatformAccessories(
      PLUGIN_IDENTIFIER,
      PLATFORM_NAME,
      accessories,
    );
  }

  accessoryExists(accessory: PlatformAccessory): boolean {
    const uuid = accessory.UUID;
    return (
      this._accessories.find((accessory) => accessory.UUID === uuid) !==
      undefined
    );
  }

  configureAccessory(accessory: PlatformAccessory): void {
    if (accessory.category === Categories.WINDOW_COVERING) {
      this.configureBlindAccessory(accessory)
        .then(() => {
          this._accessories.push(accessory);
        })
        .catch((reason) => {
          this.log.error(reason);
        });
      return;
    }

    if (
      accessory.category === Categories.OTHER &&
      accessory.context.type === 'meteo-temperature'
    ) {
      this.configureMeteoTemperatureAccessory(accessory)
        .then(() => {
          this._accessories.push(accessory);
        })
        .catch((reason) => {
          this.log.error(reason);
        });
      return;
    }

    this.log.warn(
      `Accessory category ${accessory.category} (type: ${accessory.context.type}) unknown to this platform`,
    );
  }

  async configureBlindAccessory(accessory: PlatformAccessory): Promise<void> {
    const characteristics =
      await this.container.blindCharacteristicsFactory.createCharacteristics(
        accessory,
      );
    const observer =
      this.container.blindObserverFactory.createObserver(characteristics);

    characteristics.registerListeners();
    observer.registerListeners();
  }

  async configureMeteoTemperatureAccessory(
    accessory: PlatformAccessory,
  ): Promise<void> {
    const characteristics =
      await this.container.meteoTemperatureCharacteristicsFactory.createCharacteristics(
        accessory,
      );
    const observer =
      this.container.meteoTemperatureObserverFactory.createObserver(
        characteristics,
      );

    characteristics.registerListeners();
    observer.registerListeners();
  }
}
