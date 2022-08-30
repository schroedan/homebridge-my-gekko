import {
  API,
  APIEvent,
  Categories,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service as PlatformService,
} from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import {
  BlindAccessoryFactory,
  MeteoTemperatureAccessoryFactory,
} from './accessory';
import { BlindAPI, MeteoAPI, QueryAPI } from './api';
import {
  BlindCharacteristics,
  BlindCharacteristicsFactory,
  MeteoTemperatureCharacteristics,
  MeteoTemperatureCharacteristicsFactory,
} from './characteristics';
import { Container } from './container';
import { Interval } from './interval';
import {
  BlindObserver,
  BlindObserverFactory,
  MeteoTemperatureObserver,
  MeteoTemperatureObserverFactory,
} from './observer';
import { Platform } from './platform';
import { PlatformEventEmitter } from './platform-events';

describe('Platform', () => {
  let log: MockProxy<Logging>;
  let config: MockProxy<PlatformConfig>;
  let api: MockProxy<API>;
  beforeEach(() => {
    log = mock<Logging>();
    config = mock<PlatformConfig>({
      host: '__host__',
      username: '__userbane__',
      password: '__password__',
    });
    api = mock<API>({
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
  });
  it('should provide container', () => {
    const platform = new Platform(log, config, api);

    expect(platform.container).toBeInstanceOf(Container);
  });
  it('should log an error for invalid platform config', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();

    getContainer.mockReturnValue(
      mock<Container>({
        api,
        config: {
          host: undefined,
          username: undefined,
          password: undefined,
        },
        eventEmitter,
        logger: log,
      }),
    );

    new Platform(log, config, api);

    expect(log.error).toHaveBeenCalledWith(
      'Platform config missing - please check the config file',
    );
  });
  it('should register listeners', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();

    getContainer.mockReturnValue(
      mock<Container>({
        api,
        config,
        eventEmitter,
        heartbeat: mock<Interval<() => void>>(),
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
      APIEvent.DID_FINISH_LAUNCHING,
      expect.any(Function),
    );
    expect(api.on).toHaveBeenCalledWith(
      APIEvent.SHUTDOWN,
      expect.any(Function),
    );
    expect(eventEmitter.onHeartbeat).toHaveBeenCalled();
    expect(eventEmitter.onShutdown).toHaveBeenCalled();
  });
  it('should signal heartbeat in intervals', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();

    api.on.mockImplementation(
      (event: 'didFinishLaunching' | 'shutdown', listener: () => void) => {
        event === 'didFinishLaunching' && listener();
        return api;
      },
    );
    getContainer.mockReturnValue(
      mock<Container>({
        api,
        config,
        eventEmitter,
        heartbeat: new Interval(300),
        logger: log,
        queryAPI: mock<QueryAPI>(),
      }),
    );

    new Platform(log, config, api);

    jest.advanceTimersByTime(300);

    expect(eventEmitter.signalHeartbeat).toHaveBeenCalled();
  });
  it('should signal shutdown', () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();

    api.on.mockImplementation(
      (event: 'didFinishLaunching' | 'shutdown', listener: () => void) => {
        event === 'shutdown' && listener();
        return api;
      },
    );
    getContainer.mockReturnValue(
      mock<Container>({
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
    const eventEmitter = mock<PlatformEventEmitter>();
    const heartbeat = mock<Interval<() => void>>();

    getContainer.mockReturnValue(
      mock<Container>({ api, config, eventEmitter, heartbeat, logger: log }),
    );
    eventEmitter.onShutdown.mockImplementation((listener) => {
      listener();
    });

    new Platform(log, config, api);

    expect(heartbeat.clear).toHaveBeenCalled();
  });
  it('should indicate that the accessory already exists', () => {
    const accessory = mock<PlatformAccessory>();

    accessory.UUID = '__uuid__';

    const platform = new Platform(log, config, api);

    Object.defineProperty(platform, '_accessories', {
      get: () => [accessory],
    });

    expect(platform.accessoryExists(accessory)).toEqual(true);
  });
  it('should update characteristics and register listeners when configuring blind accessory', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();
    const queryAPI = mock<QueryAPI>();
    const blind = mock<BlindAPI>();
    const blindCharacteristicsFactory = mock<BlindCharacteristicsFactory>();
    const blindCharacteristics = mock<BlindCharacteristics>();
    const blindObserverFactory = mock<BlindObserverFactory>();
    const blindObserver = mock<BlindObserver>();
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    getContainer.mockReturnValue(
      mock<Container>({
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
      mock<PlatformService>({
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
  it('should update characteristics and register listeners when configuring meteo temperature accessory', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();
    const queryAPI = mock<QueryAPI>();
    const meteo = mock<MeteoAPI>();
    const meteoTemperatureCharacteristicsFactory =
      mock<MeteoTemperatureCharacteristicsFactory>();
    const meteoTemperatureCharacteristics =
      mock<MeteoTemperatureCharacteristics>();
    const meteoTemperatureObserverFactory =
      mock<MeteoTemperatureObserverFactory>();
    const meteoTemperatureObserver = mock<MeteoTemperatureObserver>();
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    getContainer.mockReturnValue(
      mock<Container>({
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
      mock<PlatformService>({
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
    const eventEmitter = mock<PlatformEventEmitter>();
    const accessoryExists = jest.spyOn(Platform.prototype, 'accessoryExists');
    const configureAccessory = jest.spyOn(
      Platform.prototype,
      'configureAccessory',
    );
    const queryAPI = mock<QueryAPI>();
    const blind = mock<BlindAPI>();
    const meteo = mock<MeteoAPI>();
    const blindAccessoryFactory = mock<BlindAccessoryFactory>();
    const meteoTemperatureAccessoryFactory =
      mock<MeteoTemperatureAccessoryFactory>();
    const accessory = mock<PlatformAccessory>();

    queryAPI.getBlinds.mockResolvedValue([blind]);
    queryAPI.getMeteo.mockResolvedValue(meteo);

    getContainer.mockReturnValue(
      mock<Container>({
        api,
        blindAccessoryFactory,
        config,
        eventEmitter,
        logger: log,
        meteoTemperatureAccessoryFactory,
        queryAPI,
      }),
    );
    blindAccessoryFactory.createAccessory.mockResolvedValue(accessory);
    meteoTemperatureAccessoryFactory.createAccessory.mockResolvedValue(
      accessory,
    );
    accessoryExists.mockReturnValue(false);

    const platform = new Platform(log, config, api);
    const accessories = await platform.discoverAccessories();

    expect(queryAPI.getBlinds).toHaveBeenCalled();
    expect(blindAccessoryFactory.createAccessory).toHaveBeenCalledWith(blind);
    expect(meteoTemperatureAccessoryFactory.createAccessory).toHaveBeenCalled();
    expect(configureAccessory).toHaveBeenCalledWith(accessory);

    expect(accessories.length).toEqual(2);
    expect(accessories[0]).toEqual(accessory);
    expect(accessories[1]).toEqual(accessory);
  });
  it('should skip already discovered accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();
    const accessoryExists = jest.spyOn(Platform.prototype, 'accessoryExists');
    const configureAccessory = jest.spyOn(
      Platform.prototype,
      'configureAccessory',
    );
    const queryAPI = mock<QueryAPI>();
    const blind = mock<BlindAPI>();
    const meteo = mock<MeteoAPI>();
    const blindAccessoryFactory = mock<BlindAccessoryFactory>();
    const meteoTemperatureAccessoryFactory =
      mock<MeteoTemperatureAccessoryFactory>();
    const accessory = mock<PlatformAccessory>();

    queryAPI.getBlinds.mockResolvedValue([blind]);
    queryAPI.getMeteo.mockResolvedValue(meteo);

    getContainer.mockReturnValue(
      mock<Container>({
        api,
        blindAccessoryFactory,
        config,
        eventEmitter,
        logger: log,
        meteoTemperatureAccessoryFactory,
        queryAPI,
      }),
    );
    blindAccessoryFactory.createAccessory.mockResolvedValue(accessory);
    meteoTemperatureAccessoryFactory.createAccessory.mockResolvedValue(
      accessory,
    );
    accessoryExists.mockReturnValue(true);

    const platform = new Platform(log, config, api);
    const accessories = await platform.discoverAccessories();

    expect(queryAPI.getBlinds).toHaveBeenCalled();
    expect(blindAccessoryFactory.createAccessory).toHaveBeenCalledWith(blind);
    expect(meteoTemperatureAccessoryFactory.createAccessory).toHaveBeenCalled();
    expect(configureAccessory).not.toHaveBeenCalled();

    expect(accessories.length).toEqual(0);
  });
  it('should not descover blind accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();
    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const discoverMeteoAccessories = jest.spyOn(
      Platform.prototype,
      'discoverMeteoAccessories',
    );

    getContainer.mockReturnValue(
      mock<Container>({
        api,
        config: { meteo: false },
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
  it('should not descover meteo accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();
    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const discoverMeteoAccessories = jest.spyOn(
      Platform.prototype,
      'discoverMeteoAccessories',
    );

    getContainer.mockReturnValue(
      mock<Container>({
        api,
        config: { blinds: false },
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
      .mockResolvedValue([mock<PlatformAccessory>()]);

    const eventEmitter = mock<PlatformEventEmitter>();

    getContainer.mockReturnValue(
      mock<Container>({ api, config, eventEmitter, logger: log }),
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

    const eventEmitter = mock<PlatformEventEmitter>();

    getContainer.mockReturnValue(
      mock<Container>({ api, config, eventEmitter, logger: log }),
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
    const accessory = mock<PlatformAccessory>({
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
  it('should configure meteo temperature accessory', async () => {
    const accessory = mock<PlatformAccessory>({
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
  it('should log errors on blind accessory configuration', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();
    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );

    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    getContainer.mockReturnValue(
      mock<Container>({ api, eventEmitter, logger: log }),
    );
    configureBlindAccessory.mockRejectedValue('__reason__');

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureBlindAccessory).toHaveBeenCalledWith(accessory);
    expect(log.error).toHaveBeenCalledWith('__reason__');
  });
  it('should log errors on meteo temperature accessory configuration', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const eventEmitter = mock<PlatformEventEmitter>();
    const configureMeteoTemperatureAccessory = jest.spyOn(
      Platform.prototype,
      'configureMeteoTemperatureAccessory',
    );

    const accessory = mock<PlatformAccessory>({
      category: Categories.OTHER,
    });

    accessory.context.type = 'meteo-temperature';

    getContainer.mockReturnValue(
      mock<Container>({ api, eventEmitter, logger: log }),
    );
    configureMeteoTemperatureAccessory.mockRejectedValue('__reason__');

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureMeteoTemperatureAccessory).toHaveBeenCalledWith(accessory);
    expect(log.error).toHaveBeenCalledWith('__reason__');
  });
});
