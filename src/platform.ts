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

export class Platform implements DynamicPlatformPlugin {
  private _accessories: PlatformAccessory[] = [];
  private _container: Container;

  get container(): Container {
    return this._container;
  }

  constructor(logger: Logging, config: PlatformConfig, api: API) {
    this._container = new Container(config, logger, api);

    if (this.isConfigInvalid()) {
      this.container.logger.error(
        'Platform config missing - please check the config file',
      );
      return;
    }

    this.registerListeners();

    this.container.logger.info('Platform finished initializing');
  }

  isConfigInvalid(): boolean {
    return (
      this.container.config.host === undefined ||
      this.container.config.username === undefined ||
      this.container.config.password === undefined
    );
  }

  registerListeners(): void {
    this.container.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.container.heartbeat.set(() => {
        this.container.eventEmitter.signalHeartbeat();
      });
    });

    this.container.api.on(APIEvent.SHUTDOWN, () => {
      this.container.eventEmitter.signalShutdown();
    });

    this.container.eventEmitter.onHeartbeat(() => {
      this.discoverAccessories()
        .then((accessories) => {
          this.registerAccessories(accessories);
        })
        .catch((reason) => {
          this.container.logger.error(reason);
        });
    });

    this.container.eventEmitter.onShutdown(() => {
      this.container.heartbeat.clear();
    });
  }

  async discoverAccessories(): Promise<PlatformAccessory[]> {
    return [
      ...(this.container.config.blinds
        ? await this.discoverBlindAccessories()
        : []),
      ...(this.container.config.meteo
        ? await this.discoverMeteoAccessories()
        : []),
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
    this.container.api.registerPlatformAccessories(
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
          this.container.logger.error(reason);
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
          this.container.logger.error(reason);
        });
      return;
    }

    this.container.logger.warn(
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

    await observer.updateName();
    await observer.updateCurrentPosition();
    await observer.updateTargetPosition();
    await observer.updatePositionState();
    await observer.updateObstructionDetected();

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

    await observer.updateCurrentTemperature();

    characteristics.registerListeners();
    observer.registerListeners();
  }
}
