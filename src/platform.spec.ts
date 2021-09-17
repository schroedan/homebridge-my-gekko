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
import { API as QueryAPI, Blind, Meteo } from './api';
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
import { Platform, PLUGIN_IDENTIFIER } from './platform';

describe('Platform', () => {
  let log: MockProxy<Logging>;
  let config: MockProxy<PlatformConfig>;
  let api: MockProxy<API>;
  beforeEach(() => {
    log = mock<Logging>();
    config = mock<PlatformConfig>({
      name: 'myGEKKO',
      host: '__host__',
      username: '__userbane__',
      password: '__password__',
      blinds: true,
      meteo: true,
      ttl: undefined,
      interval: undefined,
      delay: undefined,
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
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  it('should provide container', () => {
    const platform = new Platform(log, config, api);
    const container = platform.container;

    expect(container).toBeInstanceOf(Container);
    expect(platform.container).toBe(container);
  });
  it('should return platform config with defaults', () => {
    config.name = undefined;
    config.blinds = undefined;
    config.meteo = undefined;

    new Platform(log, config, api);

    expect(config.name).toBe('myGEKKO');
    expect(config.blinds).toBe(true);
    expect(config.meteo).toBe(true);
  });
  it('should log an error for invalid platform config', () => {
    config.host = undefined;
    config.username = undefined;
    config.password = undefined;

    new Platform(log, config, api);

    expect(log.error).toBeCalledWith(
      'Platform config missing - please check the config file',
    );
  });
  it('should register listeners', () => {
    const onHeartbeat = jest.spyOn(Platform.prototype, 'onHeartbeat');
    const onShutdown = jest.spyOn(Platform.prototype, 'onShutdown');

    new Platform(log, config, api);

    expect(api.on).toHaveBeenCalledWith(
      APIEvent.DID_FINISH_LAUNCHING,
      expect.any(Function),
    );
    expect(api.on).toHaveBeenCalledWith(
      APIEvent.SHUTDOWN,
      expect.any(Function),
    );
    expect(onHeartbeat).toHaveBeenCalled();
    expect(onShutdown).toHaveBeenCalled();
  });
  it('should signal heartbeat in intervals', () => {
    const signalHeartbeat = jest.spyOn(Platform.prototype, 'signalHeartbeat');
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const queryAPI = mock<QueryAPI>();
    const container = mock<Container>({
      heartbeat: new Interval(300),
      queryAPI,
    });

    api.on.mockImplementation(
      (event: 'didFinishLaunching' | 'shutdown', listener: () => void) => {
        event === 'didFinishLaunching' && listener();
        return api;
      },
    );

    getContainer.mockReturnValue(container);

    new Platform(log, config, api);

    jest.advanceTimersByTime(300);

    expect(signalHeartbeat).toHaveBeenCalled();
  });
  it('should signal shutdown', () => {
    const signalShutdown = jest.spyOn(Platform.prototype, 'signalShutdown');

    api.on.mockImplementation(
      (event: 'didFinishLaunching' | 'shutdown', listener: () => void) => {
        event === 'shutdown' && listener();
        return api;
      },
    );

    new Platform(log, config, api);

    expect(signalShutdown).toHaveBeenCalled();
  });
  it('should clear heartbeat on shutdown', () => {
    const heartbeat = mock<Interval<() => void>>();
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');

    getContainer.mockReturnValue(mock<Container>({ heartbeat }));

    api.on.mockImplementation(
      (event: 'didFinishLaunching' | 'shutdown', listener: () => void) => {
        event === 'shutdown' && listener();
        return api;
      },
    );

    const platform = new Platform(log, config, api);

    platform.signalShutdown();

    expect(heartbeat.clear).toHaveBeenCalled();
  });
  it('should generate UUID', async () => {
    const generate = jest.fn();
    const api = mock<API>({ hap: { uuid: { generate } } });

    generate.mockReturnValue('__uuid__');

    const platform = new Platform(log, config, api);

    expect(platform.generateUUID('foo/bar')).toEqual('__uuid__');
    expect(generate).toHaveBeenCalledWith(`${PLUGIN_IDENTIFIER}/foo/bar`);
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
    const queryAPI = mock<QueryAPI>();
    const blind = mock<Blind>();
    const blindCharacteristicsFactory = mock<BlindCharacteristicsFactory>();
    const blindCharacteristics = mock<BlindCharacteristics>();
    const blindObserverFactory = mock<BlindObserverFactory>();
    const blindObserver = mock<BlindObserver>();
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    getContainer.mockReturnValue(
      mock<Container>({
        queryAPI,
        blindCharacteristicsFactory,
        blindObserverFactory,
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
    const queryAPI = mock<QueryAPI>();
    const meteo = mock<Meteo>();
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
        queryAPI,
        meteoTemperatureCharacteristicsFactory,
        meteoTemperatureObserverFactory,
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
    const accessoryExists = jest.spyOn(Platform.prototype, 'accessoryExists');
    const configureAccessory = jest.spyOn(
      Platform.prototype,
      'configureAccessory',
    );
    const queryAPI = mock<QueryAPI>();
    const blind = mock<Blind>();
    const meteo = mock<Meteo>();
    const blindAccessoryFactory = mock<BlindAccessoryFactory>();
    const meteoTemperatureAccessoryFactory =
      mock<MeteoTemperatureAccessoryFactory>();
    const accessory = mock<PlatformAccessory>();

    queryAPI.getBlinds.mockResolvedValue([blind]);
    queryAPI.getMeteo.mockResolvedValue(meteo);

    getContainer.mockReturnValue(
      mock<Container>({
        blindAccessoryFactory,
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
  it('should not descover blind accessories', async () => {
    config.meteo = false;

    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const discoverMeteoAccessories = jest.spyOn(
      Platform.prototype,
      'discoverMeteoAccessories',
    );

    const platform = new Platform(log, config, api);

    await platform.discoverAccessories();

    expect(discoverBlindAccessories).toHaveBeenCalled();
    expect(discoverMeteoAccessories).not.toHaveBeenCalled();
  });
  it('should not descover meteo accessories', async () => {
    config.blinds = false;

    const discoverBlindAccessories = jest.spyOn(
      Platform.prototype,
      'discoverBlindAccessories',
    );
    const discoverMeteoAccessories = jest.spyOn(
      Platform.prototype,
      'discoverMeteoAccessories',
    );

    const platform = new Platform(log, config, api);

    await platform.discoverAccessories();

    expect(discoverBlindAccessories).not.toHaveBeenCalled();
    expect(discoverMeteoAccessories).toHaveBeenCalled();
  });
  it('should skip already discovered accessories', async () => {
    const getContainer = jest.spyOn(Platform.prototype, 'container', 'get');
    const accessoryExists = jest.spyOn(Platform.prototype, 'accessoryExists');
    const configureAccessory = jest.spyOn(
      Platform.prototype,
      'configureAccessory',
    );
    const queryAPI = mock<QueryAPI>();
    const blind = mock<Blind>();
    const meteo = mock<Meteo>();
    const blindAccessoryFactory = mock<BlindAccessoryFactory>();
    const meteoTemperatureAccessoryFactory =
      mock<MeteoTemperatureAccessoryFactory>();
    const accessory = mock<PlatformAccessory>();

    queryAPI.getBlinds.mockResolvedValue([blind]);
    queryAPI.getMeteo.mockResolvedValue(meteo);

    getContainer.mockReturnValue(
      mock<Container>({
        blindAccessoryFactory,
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
  it('should register discovered accessories on heartbeat', async () => {
    const registerAccessories = jest.spyOn(
      Platform.prototype,
      'registerAccessories',
    );

    jest
      .spyOn(Platform.prototype, 'discoverAccessories')
      .mockResolvedValue([mock<PlatformAccessory>()]);

    const platform = new Platform(log, config, api);

    platform.signalHeartbeat();

    await new Promise(setImmediate);

    expect(registerAccessories).toHaveBeenCalled();
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
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    const configureBlindAccessory = jest.spyOn(
      Platform.prototype,
      'configureBlindAccessory',
    );

    configureBlindAccessory.mockRejectedValue('__reason__');

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureBlindAccessory).toHaveBeenCalledWith(accessory);
    expect(log.error).toHaveBeenCalledWith('__reason__');
  });
  it('should log errors on meteo temperature accessory configuration', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.OTHER,
    });

    accessory.context.type = 'meteo-temperature';

    const configureMeteoTemperatureAccessory = jest.spyOn(
      Platform.prototype,
      'configureMeteoTemperatureAccessory',
    );

    configureMeteoTemperatureAccessory.mockRejectedValue('__reason__');

    const platform = new Platform(log, config, api);

    platform.configureAccessory(accessory);

    await new Promise(setImmediate);

    expect(configureMeteoTemperatureAccessory).toHaveBeenCalledWith(accessory);
    expect(log.error).toHaveBeenCalledWith('__reason__');
  });
});
