import { API, Logging, PlatformConfig } from 'homebridge';
import { MockProxy } from 'jest-mock-extended';

import { Categories } from './categories';
import { Container } from './container';
import { Interval } from './interval';
import { PLATFORM_NAME, PLUGIN_IDENTIFIER, Platform } from './platform';
import {
  mockAPI,
  mockBlindAPI,
  mockBlindAccessoryFactory,
  mockBlindCharacteristics,
  mockBlindCharacteristicsFactory,
  mockBlindObserver,
  mockBlindObserverFactory,
  mockContainer,
  mockInterval,
  mockLogging,
  mockMeteoAPI,
  mockMeteoBrightnessAccessoryFactory,
  mockMeteoBrightnessCharacteristics,
  mockMeteoBrightnessCharacteristicsFactory,
  mockMeteoBrightnessObserver,
  mockMeteoBrightnessObserverFactory,
  mockMeteoTemperatureAccessoryFactory,
  mockMeteoTemperatureCharacteristics,
  mockMeteoTemperatureCharacteristicsFactory,
  mockMeteoTemperatureObserver,
  mockMeteoTemperatureObserverFactory,
  mockPlatformAccessory,
  mockPlatformConfig,
  mockPlatformEventEmitter,
  mockQueryAPI,
  mockService,
} from './test/mocks';

describe('Platform', () => {
  let log: MockProxy<Logging>;
  let config: MockProxy<PlatformConfig>;
  let api: MockProxy<API>;
  beforeEach(() => {
    log = mockLogging();
    config = mockPlatformConfig({
      host: '__host__',
      username: '__userbane__',
      password: '__password__',
    });
    api = mockAPI({
      hap: {
        uuid: {
          generate: jest.fn(),
        },
      },
    });
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it('should provide container', () => {
    const platform = new Platform(log, config, api);

    expect(platform.container).toBeInstanceOf(Container);
  });
  it('should log an error for invalid platform config', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config: mockPlatformConfig({
          plus: false,
          host: undefined,
          username: undefined,
          password: undefined,
        }),
        eventEmitter,
        logger: log,
      }),
    );

    new Platform(log, config, api);

    expect(log.error).toHaveBeenCalledWith(
      'Platform config missing - please check the config file',
    );
  });
  it.each([
    [{ plus: false, host: 'h', username: 'u', password: 'p' }, false],
    [{ plus: false, host: undefined, username: 'u', password: 'p' }, true],
    [{ plus: false, host: 'h', username: undefined, password: 'p' }, true],
    [{ plus: false, host: 'h', username: 'u', password: undefined }, true],
    [{ plus: true, username: 'u', key: 'k', gekkoid: 'g' }, false],
    [{ plus: true, username: undefined, key: 'k', gekkoid: 'g' }, true],
    [{ plus: true, username: 'u', key: undefined, gekkoid: 'g' }, true],
    [{ plus: true, username: 'u', key: 'k', gekkoid: undefined }, true],
  ])('should validate platform config %o as invalid: %s', (props, invalid) => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config: mockPlatformConfig(props),
        eventEmitter: mockPlatformEventEmitter(),
        logger: log,
      }),
    );

    const platform = new Platform(log, config, api);

    expect(platform.isConfigInvalid()).toBe(invalid);
  });
  it('should register listeners', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config,
        eventEmitter,
        heartbeat: mockInterval(),
        logger: log,
      }),
    );
    eventEmitter.onHeartbeat.mockImplementation((listener) => {
      listener();
    });
    eventEmitter.onShutdown.mockImplementation((listener) => {
      listener();
    });

    new Platform(log, config, api);

    expect(api.on).toHaveBeenCalledWith(
      'didFinishLaunching',
      expect.any(Function),
    );
    expect(api.on).toHaveBeenCalledWith('shutdown', expect.any(Function));
    expect(eventEmitter.onHeartbeat).toHaveBeenCalled();
    expect(eventEmitter.onShutdown).toHaveBeenCalled();
  });
  it('should signal heartbeat in intervals', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();

    api.on.mockImplementation(
      (event: 'didFinishLaunching' | 'shutdown', listener: () => void) => {
        if (event === 'didFinishLaunching') {
          listener();
        }
        return api;
      },
    );
    getContainer.mockReturnValue(
      mockContainer({
        api,
        config,
        eventEmitter,
        heartbeat: new Interval(300),
        logger: log,
        queryAPI: mockQueryAPI(),
      }),
    );

    new Platform(log, config, api);

    jest.advanceTimersByTime(300);

    expect(eventEmitter.signalHeartbeat).toHaveBeenCalled();
  });
  it('should signal shutdown', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();

    api.on.mockImplementation(
      (event: 'didFinishLaunching' | 'shutdown', listener: () => void) => {
        if (event === 'shutdown') {
          listener();
        }
        return api;
      },
    );
    getContainer.mockReturnValue(
      mockContainer({
        api,
        config,
        eventEmitter,
        logger: log,
      }),
    );

    new Platform(log, config, api);

    expect(eventEmitter.signalShutdown).toHaveBeenCalled();
  });
  it('should clear heartbeat on shutdown', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const heartbeat = mockInterval();

    getContainer.mockReturnValue(
      mockContainer({ api, config, eventEmitter, heartbeat, logger: log }),
    );
    eventEmitter.onShutdown.mockImplementation((listener) => {
      listener();
    });

    new Platform(log, config, api);

    expect(heartbeat.clear).toHaveBeenCalled();
  });
  it('should indicate that the accessory already exists', () => {
    const accessory = mockPlatformAccessory();

    accessory.UUID = '__uuid__';

    const platform = new Platform(log, config, api);

    Object.defineProperty(platform, '_accessories', {
      get: () => [accessory],
    });

    expect(platform.accessoryExists(accessory)).toEqual(true);
  });
  it('should update characteristics and register listeners when configuring blind accessory', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const queryAPI = mockQueryAPI();
    const blind = mockBlindAPI();
    const blindCharacteristicsFactory = mockBlindCharacteristicsFactory();
    const blindCharacteristics = mockBlindCharacteristics();
    const blindObserverFactory = mockBlindObserverFactory();
    const blindObserver = mockBlindObserver();
    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        blindCharacteristicsFactory,
        blindObserverFactory,
        eventEmitter,
        logger: log,
        queryAPI,
      }),
    );
    queryAPI.getBlind.mockResolvedValue(blind);
    blindCharacteristicsFactory.createCharacteristics.mockResolvedValue(
      blindCharacteristics,
    );
    blindObserverFactory.createObserver.mockReturnValue(blindObserver);
    accessory.getService.mockReturnValue(
      mockService({
        getCharacteristic: jest.fn().mockImplementation(() => {
          return {
            onGet: jest.fn(),
            onSet: jest.fn(),
          };
        }),
      }),
    );

    const platform = new Platform(log, config, api);

    await platform.configureBlindAccessory(accessory);

    expect(blindObserver.updateName).toHaveBeenCalled();
    expect(blindObserver.updateCurrentPosition).toHaveBeenCalled();
    expect(blindObserver.updateTargetPosition).toHaveBeenCalled();
    expect(blindObserver.updatePositionState).toHaveBeenCalled();
    expect(blindObserver.updateObstructionDetected).toHaveBeenCalled();

    expect(blindCharacteristics.registerListeners).toHaveBeenCalled();
    expect(blindObserver.registerListeners).toHaveBeenCalled();
  });
  it('should update characteristics and register listeners when configuring meteo brightness accessory', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const queryAPI = mockQueryAPI();
    const meteo = mockMeteoAPI();
    const meteoBrightnessCharacteristicsFactory =
      mockMeteoBrightnessCharacteristicsFactory();
    const meteoBrightnessCharacteristics = mockMeteoBrightnessCharacteristics();
    const meteoBrightnessObserverFactory = mockMeteoBrightnessObserverFactory();
    const meteoBrightnessObserver = mockMeteoBrightnessObserver();
    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        eventEmitter,
        logger: log,
        meteoBrightnessCharacteristicsFactory,
        meteoBrightnessObserverFactory,
        queryAPI,
      }),
    );
    queryAPI.getMeteo.mockResolvedValue(meteo);
    meteoBrightnessCharacteristicsFactory.createCharacteristics.mockResolvedValue(
      meteoBrightnessCharacteristics,
    );
    meteoBrightnessObserverFactory.createObserver.mockReturnValue(
      meteoBrightnessObserver,
    );
    accessory.getService.mockReturnValue(
      mockService({
        getCharacteristic: jest.fn().mockImplementation(() => {
          return {
            onGet: jest.fn(),
          };
        }),
      }),
    );

    const platform = new Platform(log, config, api);

    await platform.configureMeteoBrightnessAccessory(accessory);

    expect(
      meteoBrightnessObserver.updateCurrentAmbientLightLevel,
    ).toHaveBeenCalled();

    expect(meteoBrightnessCharacteristics.registerListeners).toHaveBeenCalled();

    expect(meteoBrightnessObserver.registerListeners).toHaveBeenCalled();
  });
  it('should update characteristics and register listeners when configuring meteo temperature accessory', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const queryAPI = mockQueryAPI();
    const meteo = mockMeteoAPI();
    const meteoTemperatureCharacteristicsFactory =
      mockMeteoTemperatureCharacteristicsFactory();
    const meteoTemperatureCharacteristics =
      mockMeteoTemperatureCharacteristics();
    const meteoTemperatureObserverFactory =
      mockMeteoTemperatureObserverFactory();
    const meteoTemperatureObserver = mockMeteoTemperatureObserver();
    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        eventEmitter,
        logger: log,
        meteoTemperatureCharacteristicsFactory,
        meteoTemperatureObserverFactory,
        queryAPI,
      }),
    );
    queryAPI.getMeteo.mockResolvedValue(meteo);
    meteoTemperatureCharacteristicsFactory.createCharacteristics.mockResolvedValue(
      meteoTemperatureCharacteristics,
    );
    meteoTemperatureObserverFactory.createObserver.mockReturnValue(
      meteoTemperatureObserver,
    );
    accessory.getService.mockReturnValue(
      mockService({
        getCharacteristic: jest.fn().mockImplementation(() => {
          return {
            onGet: jest.fn(),
          };
        }),
      }),
    );

    const platform = new Platform(log, config, api);

    await platform.configureMeteoTemperatureAccessory(accessory);

    expect(
      meteoTemperatureObserver.updateCurrentTemperature,
    ).toHaveBeenCalled();

    expect(
      meteoTemperatureCharacteristics.registerListeners,
    ).toHaveBeenCalled();

    expect(meteoTemperatureObserver.registerListeners).toHaveBeenCalled();
  });
  it('should discover only new accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const accessoryExists = jest.spyOn(Platform.prototype, 'accessoryExists');
    const configureAccessory = jest.spyOn(
      Platform.prototype,
      'configureAccessory',
    );
    const queryAPI = mockQueryAPI();
    const blind = mockBlindAPI();
    const meteo = mockMeteoAPI();
    const blindAccessoryFactory = mockBlindAccessoryFactory();
    const meteoBrightnessAccessoryFactory =
      mockMeteoBrightnessAccessoryFactory();
    const meteoTemperatureAccessoryFactory =
      mockMeteoTemperatureAccessoryFactory();
    const accessory = mockPlatformAccessory();

    queryAPI.getBlinds.mockResolvedValue([blind]);
    queryAPI.getMeteo.mockResolvedValue(meteo);

    getContainer.mockReturnValue(
      mockContainer({
        api,
        blindAccessoryFactory,
        config,
        eventEmitter,
        logger: log,
        meteoBrightnessAccessoryFactory,
        meteoTemperatureAccessoryFactory,
        queryAPI,
      }),
    );
    blindAccessoryFactory.createAccessory.mockReturnValue(accessory);
    meteoBrightnessAccessoryFactory.createAccessory.mockReturnValue(accessory);
    meteoTemperatureAccessoryFactory.createAccessory.mockReturnValue(accessory);
    accessoryExists.mockReturnValue(false);

    const platform = new Platform(log, config, api);
    const accessories = await platform.discoverAccessories();

    expect(queryAPI.getBlinds).toHaveBeenCalled();
    expect(blindAccessoryFactory.createAccessory).toHaveBeenCalled();
    expect(meteoBrightnessAccessoryFactory.createAccessory).toHaveBeenCalled();
    expect(meteoTemperatureAccessoryFactory.createAccessory).toHaveBeenCalled();
    expect(configureAccessory).toHaveBeenCalledWith(accessory);

    expect(accessories.length).toEqual(5);
    expect(accessories[0]).toEqual(accessory);
    expect(accessories[1]).toEqual(accessory);
    expect(accessories[2]).toEqual(accessory);
  });
  it('should skip already discovered accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const accessoryExists = jest.spyOn(Platform.prototype, 'accessoryExists');
    const configureAccessory = jest.spyOn(
      Platform.prototype,
      'configureAccessory',
    );
    const queryAPI = mockQueryAPI();
    const blind = mockBlindAPI();
    const meteo = mockMeteoAPI();
    const blindAccessoryFactory = mockBlindAccessoryFactory();
    const meteoBrightnessAccessoryFactory =
      mockMeteoBrightnessAccessoryFactory();
    const meteoTemperatureAccessoryFactory =
      mockMeteoTemperatureAccessoryFactory();
    const accessory = mockPlatformAccessory();

    queryAPI.getBlinds.mockResolvedValue([blind]);
    queryAPI.getMeteo.mockResolvedValue(meteo);

    getContainer.mockReturnValue(
      mockContainer({
        api,
        blindAccessoryFactory,
        config,
        eventEmitter,
        logger: log,
        meteoBrightnessAccessoryFactory,
        meteoTemperatureAccessoryFactory,
        queryAPI,
      }),
    );
    blindAccessoryFactory.createAccessory.mockReturnValue(accessory);
    meteoBrightnessAccessoryFactory.createAccessory.mockReturnValue(accessory);
    meteoTemperatureAccessoryFactory.createAccessory.mockReturnValue(accessory);
    accessoryExists.mockReturnValue(true);

    const platform = new Platform(log, config, api);
    const accessories = await platform.discoverAccessories();

    expect(queryAPI.getBlinds).toHaveBeenCalled();
    expect(blindAccessoryFactory.createAccessory).toHaveBeenCalled();
    expect(meteoBrightnessAccessoryFactory.createAccessory).toHaveBeenCalled();
    expect(meteoTemperatureAccessoryFactory.createAccessory).toHaveBeenCalled();
    expect(configureAccessory).not.toHaveBeenCalled();

    expect(accessories.length).toEqual(0);
  });
  it('should not discover blind accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const discoverMeteoAccessories = jest.spyOn(
      Platform.prototype,
      'discoverMeteoAccessories',
    );

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config: mockPlatformConfig({ meteo: false }),
        eventEmitter,
        logger: log,
      }),
    );
    discoverBlindAccessories.mockImplementation(async () => []);

    const platform = new Platform(log, config, api);

    await platform.discoverAccessories();

    expect(discoverBlindAccessories).toHaveBeenCalled();
    expect(discoverMeteoAccessories).not.toHaveBeenCalled();
  });
  it('should not discover meteo accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const discoverMeteoAccessories = jest.spyOn(
      Platform.prototype,
      'discoverMeteoAccessories',
    );

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config: mockPlatformConfig({ blinds: false }),
        eventEmitter,
        logger: log,
      }),
    );
    discoverMeteoAccessories.mockImplementation(async () => []);

    const platform = new Platform(log, config, api);

    await platform.discoverAccessories();

    expect(discoverBlindAccessories).not.toHaveBeenCalled();
    expect(discoverMeteoAccessories).toHaveBeenCalled();
  });
  it('should register discovered accessories on heartbeat', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const registerAccessories = jest.spyOn(
      Platform.prototype,
      'registerAccessories',
    );

    jest
      .spyOn(Platform.prototype, 'discoverAccessories')
      .mockResolvedValue([mockPlatformAccessory()]);

    const eventEmitter = mockPlatformEventEmitter();

    getContainer.mockReturnValue(
      mockContainer({ api, config, eventEmitter, logger: log }),
    );
    eventEmitter.onHeartbeat.mockImplementation((listener) => {
      listener();
    });

    new Platform(log, config, api);

    await new Promise(setImmediate);

    expect(registerAccessories).toHaveBeenCalled();
  });
  it('should log errors on accessory discovery', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const registerAccessories = jest.spyOn(
      Platform.prototype,
      'registerAccessories',
    );

    jest
      .spyOn(Platform.prototype, 'discoverAccessories')
      .mockRejectedValue('__reason__');

    const eventEmitter = mockPlatformEventEmitter();

    getContainer.mockReturnValue(
      mockContainer({ api, config, eventEmitter, logger: log }),
    );
    eventEmitter.onHeartbeat.mockImplementation((listener) => {
      listener();
    });

    new Platform(log, config, api);

    await new Promise(setImmediate);

    expect(registerAccessories).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledWith('__reason__');
  });
  it('should configure blind accessory', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
    });

    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );

    configureBlindAccessory.mockResolvedValue(undefined);

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureBlindAccessory).toHaveBeenCalledWith(accessory);
  });
  it('should configure meteo brightness accessory', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.context.type = 'meteo-brightness';

    const configureMeteoBrightnessAccessory = jest.spyOn(
      Platform.prototype,
      'configureMeteoBrightnessAccessory',
    );

    configureMeteoBrightnessAccessory.mockResolvedValue(undefined);

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureMeteoBrightnessAccessory).toHaveBeenCalledWith(accessory);
  });
  it('should configure meteo temperature accessory', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.context.type = 'meteo-temperature';

    const configureMeteoTemperatureAccessory = jest.spyOn(
      Platform.prototype,
      'configureMeteoTemperatureAccessory',
    );

    configureMeteoTemperatureAccessory.mockResolvedValue(undefined);

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureMeteoTemperatureAccessory).toHaveBeenCalledWith(accessory);
  });
  it('should track accessories whose configuration failed', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );
    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
      UUID: '__uuid__',
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config,
        eventEmitter: mockPlatformEventEmitter(),
        logger: log,
      }),
    );
    configureBlindAccessory.mockRejectedValue('__reason__');

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(log.error).toHaveBeenCalledWith('__reason__');
    // a failed configuration must not lead to a second registration
    expect(platform.accessoryExists(accessory)).toBe(true);
  });
  it('should not track accessories of unknown type', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
      context: { type: '__unknown__' },
      UUID: '__uuid__',
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        eventEmitter: mockPlatformEventEmitter(),
        logger: log,
      }),
    );

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    expect(log.warn).toHaveBeenCalled();
    expect(platform.accessoryExists(accessory)).toBe(false);
  });
  it('should log errors on blind accessory configuration', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );

    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
    });

    getContainer.mockReturnValue(
      mockContainer({ api, config, eventEmitter, logger: log }),
    );
    configureBlindAccessory.mockRejectedValue('__reason__');

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureBlindAccessory).toHaveBeenCalledWith(accessory);
    expect(log.error).toHaveBeenCalledWith('__reason__');
  });
  it('should log errors on meteo brightness accessory configuration', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const configureMeteoBrightnessAccessory = jest.spyOn(
      Platform.prototype,
      'configureMeteoBrightnessAccessory',
    );

    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.context.type = 'meteo-brightness';

    getContainer.mockReturnValue(
      mockContainer({ api, config, eventEmitter, logger: log }),
    );
    configureMeteoBrightnessAccessory.mockRejectedValue('__reason__');

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureMeteoBrightnessAccessory).toHaveBeenCalledWith(accessory);
    expect(log.error).toHaveBeenCalledWith('__reason__');
  });
  it('should log errors on meteo temperature accessory configuration', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();
    const configureMeteoTemperatureAccessory = jest.spyOn(
      Platform.prototype,
      'configureMeteoTemperatureAccessory',
    );

    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.context.type = 'meteo-temperature';

    getContainer.mockReturnValue(
      mockContainer({ api, config, eventEmitter, logger: log }),
    );
    configureMeteoTemperatureAccessory.mockRejectedValue('__reason__');

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureMeteoTemperatureAccessory).toHaveBeenCalledWith(accessory);
    expect(log.error).toHaveBeenCalledWith('__reason__');
  });
  it('should log warnings on unknown accessory configuration', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mockPlatformEventEmitter();

    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.context.type = 'unknown';

    getContainer.mockReturnValue(
      mockContainer({ api, config, eventEmitter, logger: log }),
    );

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(log.warn).toHaveBeenCalledWith(
      'Accessory category 1 (type: unknown) unknown to this platform',
    );
  });
  it('should not configure accessories of disabled systems', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );
    const configureMeteoBrightnessAccessory = jest.spyOn(
      Platform.prototype,
      'configureMeteoBrightnessAccessory',
    );
    const blind = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
      UUID: '__blind__',
    });
    const meteo = mockPlatformAccessory({
      category: Categories.OTHER,
      context: { type: 'meteo-brightness' },
      UUID: '__meteo__',
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config: mockPlatformConfig({ blinds: false, meteo: false }),
        eventEmitter: mockPlatformEventEmitter(),
        logger: log,
      }),
    );

    const platform = new Platform(log, config, api);

    platform.configureAccessory(blind);
    platform.configureAccessory(meteo);

    expect(configureBlindAccessory).not.toHaveBeenCalled();
    expect(configureMeteoBrightnessAccessory).not.toHaveBeenCalled();
    // tracked, so that they are removed with the next discovery
    expect(platform.accessoryExists(blind)).toBe(true);
    expect(platform.accessoryExists(meteo)).toBe(true);
  });
  it('should remove stale accessories once after the first discovery', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );
    const available = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
      UUID: '__available__',
      displayName: '__available__',
    });
    const stale = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
      UUID: '__stale__',
      displayName: '__stale__',
    });
    const removedLater = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
      UUID: '__removed_later__',
      displayName: '__removed_later__',
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config: mockPlatformConfig({ blinds: true, meteo: false }),
        eventEmitter: mockPlatformEventEmitter(),
        logger: log,
      }),
    );
    configureBlindAccessory.mockResolvedValue();
    discoverBlindAccessories.mockResolvedValue([available, removedLater]);

    const platform = new Platform(log, config, api);

    platform.configureAccessory(available);
    platform.configureAccessory(stale);
    platform.configureAccessory(removedLater);

    await platform.discoverAccessories();

    expect(log.info).toHaveBeenCalledWith(
      'Removing accessory __stale__, which is no longer available',
    );
    expect(api.unregisterPlatformAccessories).toHaveBeenCalledWith(
      PLUGIN_IDENTIFIER,
      PLATFORM_NAME,
      [stale],
    );
    expect(platform.accessoryExists(stale)).toBe(false);
    expect(platform.accessoryExists(available)).toBe(true);

    // later discoveries do not remove accessories anymore
    discoverBlindAccessories.mockResolvedValue([available]);

    await platform.discoverAccessories();

    expect(api.unregisterPlatformAccessories).toHaveBeenCalledTimes(1);
    expect(platform.accessoryExists(removedLater)).toBe(true);
  });
  it('should not remove accessories if there are no stale accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );
    const available = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
      UUID: '__available__',
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config: mockPlatformConfig({ blinds: true, meteo: false }),
        eventEmitter: mockPlatformEventEmitter(),
        logger: log,
      }),
    );
    configureBlindAccessory.mockResolvedValue();
    discoverBlindAccessories.mockResolvedValue([available]);

    const platform = new Platform(log, config, api);

    platform.configureAccessory(available);

    await platform.discoverAccessories();

    expect(api.unregisterPlatformAccessories).not.toHaveBeenCalled();
  });
  it('should not remove accessories if the discovery fails', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );
    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
      UUID: '__uuid__',
    });

    getContainer.mockReturnValue(
      mockContainer({
        api,
        config: mockPlatformConfig({ blinds: true, meteo: false }),
        eventEmitter: mockPlatformEventEmitter(),
        logger: log,
      }),
    );
    configureBlindAccessory.mockResolvedValue();
    discoverBlindAccessories.mockRejectedValueOnce(new Error('__offline__'));
    discoverBlindAccessories.mockResolvedValueOnce([]);

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await expect(platform.discoverAccessories()).rejects.toThrow('__offline__');
    expect(api.unregisterPlatformAccessories).not.toHaveBeenCalled();

    // the clean up is retried with the next successful discovery
    await platform.discoverAccessories();

    expect(api.unregisterPlatformAccessories).toHaveBeenCalledWith(
      PLUGIN_IDENTIFIER,
      PLATFORM_NAME,
      [accessory],
    );
  });
});
