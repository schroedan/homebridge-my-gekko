import {
  API,
  Logging,
  PlatformConfig,
  Service as PlatformService,
} from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import {
  BlindAccessoryFactory,
  MeteoBrightnessAccessoryFactory,
  MeteoTemperatureAccessoryFactory,
} from './accessory';
import { LocalQueryAPIClient, PlusQueryAPIClient, QueryAPI } from './api';
import {
  BlindCharacteristicsFactory,
  MeteoBrightnessCharacteristicsFactory,
  MeteoTemperatureCharacteristicsFactory,
} from './characteristics';
import { Container } from './container';
import { Interval } from './interval';
import {
  BlindObserverFactory,
  MeteoBrightnessObserverFactory,
  MeteoTemperatureObserverFactory,
} from './observer';
import { PlatformEventEmitter } from './platform-events';
import { UUID } from './uuid';

describe('Container', () => {
  let config: MockProxy<PlatformConfig>;
  let logger: MockProxy<Logging>;
  let api: MockProxy<API>;
  beforeEach(() => {
    config = mock<PlatformConfig>();
    logger = mock<Logging>();
    api = mock<API>({
      hap: {
        Service: mock<typeof PlatformService>(),
      },
    });
  });
  it('should provide logger and api', () => {
    const container = new Container(config, logger, api);

    expect(container.logger).toBe(logger);
    expect(container.api).toBe(api);
  });
  it('should provide blind accessory factory', () => {
    const container = new Container(config, logger, api);
    const blindAccessoryFactory = container.blindAccessoryFactory;

    expect(blindAccessoryFactory).toBeInstanceOf(BlindAccessoryFactory);
    expect(container.blindAccessoryFactory).toBe(blindAccessoryFactory);
  });
  it('should provide blind characteristics factory', () => {
    const container = new Container(config, logger, api);
    const blindCharacteristicsFactory = container.blindCharacteristicsFactory;

    expect(blindCharacteristicsFactory).toBeInstanceOf(
      BlindCharacteristicsFactory,
    );
    expect(container.blindCharacteristicsFactory).toBe(
      blindCharacteristicsFactory,
    );
  });
  it('should provide blind observer factory', () => {
    const container = new Container(config, logger, api);
    const blindObserverFactory = container.blindObserverFactory;

    expect(blindObserverFactory).toBeInstanceOf(BlindObserverFactory);
    expect(container.blindObserverFactory).toBe(blindObserverFactory);
  });
  it('should provide platform config with defaults', () => {
    const container = new Container(config, logger, api);

    expect(container.config.name).toBe('myGEKKO');
    expect(container.config.blinds).toBe(true);
    expect(container.config.meteo).toBe(true);
    expect(container.config.ttl).toBe(1);
    expect(container.config.interval).toBe(3);
    expect(container.config.deferance).toBe(10);
    expect(container.config.delay).toBe(500);
  });
  it('should provide platform event emitter', () => {
    const container = new Container(config, logger, api);
    const eventEmitter = container.eventEmitter;

    expect(eventEmitter).toBeInstanceOf(PlatformEventEmitter);
    expect(container.eventEmitter).toBe(eventEmitter);
  });
  it('should provide heartbeat', () => {
    const container = new Container(config, logger, api);
    const heartbeat = container.heartbeat;

    expect(heartbeat).toBeInstanceOf(Interval);
    expect(container.heartbeat).toBe(heartbeat);
  });
  it('should provide heartbeat with custom interval', () => {
    config.interval = 10;

    const container = new Container(config, logger, api);

    expect(container.heartbeat.interval).toBe(10000);
  });
  it('should provide meteo brightness accessory factory', () => {
    const container = new Container(config, logger, api);
    const meteoBrightnessAccessoryFactory =
      container.meteoBrightnessAccessoryFactory;

    expect(meteoBrightnessAccessoryFactory).toBeInstanceOf(
      MeteoBrightnessAccessoryFactory,
    );
    expect(container.meteoBrightnessAccessoryFactory).toBe(
      meteoBrightnessAccessoryFactory,
    );
  });
  it('should provide meteo brightness characteristics factory', () => {
    const container = new Container(config, logger, api);
    const meteoBrightnessCharacteristicsFactory =
      container.meteoBrightnessCharacteristicsFactory;

    expect(meteoBrightnessCharacteristicsFactory).toBeInstanceOf(
      MeteoBrightnessCharacteristicsFactory,
    );
    expect(container.meteoBrightnessCharacteristicsFactory).toBe(
      meteoBrightnessCharacteristicsFactory,
    );
  });
  it('should provide meteo brightness observer factory', () => {
    const container = new Container(config, logger, api);
    const meteoBrightnessObserverFactory =
      container.meteoBrightnessObserverFactory;

    expect(meteoBrightnessObserverFactory).toBeInstanceOf(
      MeteoBrightnessObserverFactory,
    );
    expect(container.meteoBrightnessObserverFactory).toBe(
      meteoBrightnessObserverFactory,
    );
  });
  it('should provide meteo temperature accessory factory', () => {
    const container = new Container(config, logger, api);
    const meteoTemperatureAccessoryFactory =
      container.meteoTemperatureAccessoryFactory;

    expect(meteoTemperatureAccessoryFactory).toBeInstanceOf(
      MeteoTemperatureAccessoryFactory,
    );
    expect(container.meteoTemperatureAccessoryFactory).toBe(
      meteoTemperatureAccessoryFactory,
    );
  });
  it('should provide meteo temperature characteristics factory', () => {
    const container = new Container(config, logger, api);
    const meteoTemperatureCharacteristicsFactory =
      container.meteoTemperatureCharacteristicsFactory;

    expect(meteoTemperatureCharacteristicsFactory).toBeInstanceOf(
      MeteoTemperatureCharacteristicsFactory,
    );
    expect(container.meteoTemperatureCharacteristicsFactory).toBe(
      meteoTemperatureCharacteristicsFactory,
    );
  });
  it('should provide meteo temperature observer factory', () => {
    const container = new Container(config, logger, api);
    const meteoTemperatureObserverFactory =
      container.meteoTemperatureObserverFactory;

    expect(meteoTemperatureObserverFactory).toBeInstanceOf(
      MeteoTemperatureObserverFactory,
    );
    expect(container.meteoTemperatureObserverFactory).toBe(
      meteoTemperatureObserverFactory,
    );
  });
  it('should provide query API', () => {
    const container = new Container(config, logger, api);
    const queryAPI = container.queryAPI;

    expect(queryAPI).toBeInstanceOf(QueryAPI);
    expect(container.queryAPI).toBe(queryAPI);
  });
  it('should provide local query API client', () => {
    const container = new Container(config, logger, api);
    const queryAPIClient = container.queryAPIClient;

    expect(queryAPIClient).toBeInstanceOf(LocalQueryAPIClient);
    expect(container.queryAPIClient).toBe(queryAPIClient);
  });
  it('should provide plus query API client', () => {
    const container = new Container({ ...config, plus: true }, logger, api);
    const queryAPIClient = container.queryAPIClient;

    expect(queryAPIClient).toBeInstanceOf(PlusQueryAPIClient);
    expect(container.queryAPIClient).toBe(queryAPIClient);
  });
  it('should provide UUID', () => {
    const container = new Container(config, logger, api);
    const uuid = container.uuid;

    expect(uuid).toBeInstanceOf(UUID);
    expect(container.uuid).toBe(uuid);
  });
});
