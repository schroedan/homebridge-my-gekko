import {
  API,
  DynamicPlatformPlugin,
  Logging,
  PlatformAccessory,
  PlatformConfig,
} from 'homebridge';

import { Categories } from './categories';
import { Container } from './container';
import { describeError } from './describe-error';

export const PLUGIN_IDENTIFIER = 'homebridge-my-gekko';

export const PLATFORM_NAME = 'mygekko';

export class Platform implements DynamicPlatformPlugin {
  private _accessories: PlatformAccessory[] = [];
  private _staleAccessoriesRemoved = false;
  private _container: Container;

  get container(): Container {
    return this._container;
  }

  constructor(
    readonly logger: Logging,
    readonly config: PlatformConfig,
    readonly api: API,
  ) {
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
    const { config } = this.container;

    if (config.plus) {
      return (
        config.username === undefined ||
        config.key === undefined ||
        config.gekkoid === undefined
      );
    }

    return (
      config.host === undefined ||
      config.username === undefined ||
      config.password === undefined
    );
  }

  registerListeners(): void {
    this.container.api.on('didFinishLaunching', () => {
      this.container.heartbeat.set(() => {
        this.container.eventEmitter.signalHeartbeat();
      });
    });

    this.container.api.on('shutdown', () => {
      this.container.eventEmitter.signalShutdown();
    });

    this.container.eventEmitter.onHeartbeat(() => {
      this.discoverAccessories()
        .then((accessories) => {
          this.registerAccessories(accessories);
        })
        .catch((reason) => {
          this.container.logger.error(describeError(reason));
        });
    });

    this.container.eventEmitter.onShutdown(() => {
      this.container.heartbeat.clear();
    });
  }

  async discoverAccessories(): Promise<PlatformAccessory[]> {
    const discovered = [
      ...(this.container.config.blinds
        ? await this.discoverBlindAccessories()
        : []),
      ...(this.container.config.meteo
        ? await this.discoverMeteoAccessories()
        : []),
    ];

    // only clean up once after startup, so that temporary glitches of the
    // myGEKKO do not remove accessories while running
    if (!this._staleAccessoriesRemoved) {
      this.removeStaleAccessories(discovered);
      this._staleAccessoriesRemoved = true;
    }

    const accessories = discovered.filter(
      (accessory) => !this.accessoryExists(accessory),
    );

    for (const accessory of accessories) {
      this.configureAccessory(accessory);
    }

    return accessories;
  }

  async discoverBlindAccessories(): Promise<PlatformAccessory[]> {
    const accessories: PlatformAccessory[] = [];
    const blinds = await this.container.queryAPI.getBlinds();

    for (const blind of blinds) {
      accessories.push(
        this.container.blindAccessoryFactory.createAccessory(
          await blind.getName(),
          blind.key,
        ),
      );
    }

    return accessories;
  }

  async discoverMeteoAccessories(): Promise<PlatformAccessory[]> {
    return [
      this.container.meteoBrightnessAccessoryFactory.createAccessory(
        'Meteo Brightness South',
        'brightness',
      ),
      this.container.meteoBrightnessAccessoryFactory.createAccessory(
        'Meteo Brightness East',
        'brightnesso',
      ),
      this.container.meteoBrightnessAccessoryFactory.createAccessory(
        'Meteo Brightness West',
        'brightnessw',
      ),
      this.container.meteoTemperatureAccessoryFactory.createAccessory(
        'Meteo Temperature',
        'temperature',
      ),
    ];
  }

  removeStaleAccessories(discovered: PlatformAccessory[]): void {
    const uuids = new Set(discovered.map((accessory) => accessory.UUID));
    const stale = this._accessories.filter(
      (accessory) => !uuids.has(accessory.UUID),
    );

    if (stale.length === 0) {
      return;
    }

    for (const accessory of stale) {
      this.container.logger.info(
        `Removing accessory ${accessory.displayName}, which is no longer available`,
      );
    }

    this.container.api.unregisterPlatformAccessories(
      PLUGIN_IDENTIFIER,
      PLATFORM_NAME,
      stale,
    );

    this._accessories = this._accessories.filter((accessory) =>
      uuids.has(accessory.UUID),
    );
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
    const { config } = this.container;
    let configure: () => Promise<void>;
    let enabled: boolean;

    if (accessory.category === Categories.WINDOW_COVERING) {
      configure = () => this.configureBlindAccessory(accessory);
      enabled = config.blinds;
    } else if (
      accessory.category === Categories.OTHER &&
      accessory.context.type === 'meteo-brightness'
    ) {
      configure = () => this.configureMeteoBrightnessAccessory(accessory);
      enabled = config.meteo;
    } else if (
      accessory.category === Categories.OTHER &&
      accessory.context.type === 'meteo-temperature'
    ) {
      configure = () => this.configureMeteoTemperatureAccessory(accessory);
      enabled = config.meteo;
    } else {
      this.container.logger.warn(
        `Accessory category ${accessory.category} (type: ${accessory.context.type}) unknown to this platform`,
      );
      return;
    }

    // track the accessory right away, so that it is not discovered and
    // registered a second time if its configuration fails
    this._accessories.push(accessory);

    // accessories of disabled systems are removed with the next discovery
    if (!enabled) {
      return;
    }

    configure().catch((reason) => {
      this.container.logger.error(describeError(reason));
    });
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

  async configureMeteoBrightnessAccessory(
    accessory: PlatformAccessory,
  ): Promise<void> {
    const characteristics =
      await this.container.meteoBrightnessCharacteristicsFactory.createCharacteristics(
        accessory,
      );
    const observer =
      this.container.meteoBrightnessObserverFactory.createObserver(
        characteristics,
      );

    await observer.updateCurrentAmbientLightLevel();

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
