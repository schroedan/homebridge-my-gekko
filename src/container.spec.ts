import { Service as PlatformService } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import {
  BlindAccessoryFactory,
  MeteoTemperatureAccessoryFactory,
} from './accessory';
import { API as QueryAPI, Client, LocalConnection, MemoryCache } from './api';
import {
  BlindCharacteristicsFactory,
  MeteoTemperatureCharacteristicsFactory,
} from './characteristics';
import { Container } from './container';
import { Interval } from './interval';
import {
  BlindObserverFactory,
  MeteoTemperatureObserverFactory,
} from './observer';
import { Platform } from './platform';

describe('Container', () => {
  let platform: MockProxy<Platform>;
  beforeEach(() => {
    platform = mock<Platform>({
      config: {
        host: '__host__',
        username: '__userbane__',
        password: '__password__',
        ttl: undefined,
        interval: undefined,
        delay: undefined,
      },
      api: {
        hap: {
          Service: mock<typeof PlatformService>(),
        },
      },
    });
  });
  it('should provide platform', () => {
    const container = new Container(platform);

    expect(container.platform).toBe(platform);
  });
  it('should provide blind accessory factory', () => {
    const container = new Container(platform);
    const blindAccessoryFactory = container.blindAccessoryFactory;

    expect(blindAccessoryFactory).toBeInstanceOf(BlindAccessoryFactory);
    expect(container.blindAccessoryFactory).toBe(blindAccessoryFactory);
  });
  it('should provide blind characteristics factory', () => {
    const container = new Container(platform);
    const blindCharacteristicsFactory = container.blindCharacteristicsFactory;

    expect(blindCharacteristicsFactory).toBeInstanceOf(
      BlindCharacteristicsFactory,
    );
    expect(container.blindCharacteristicsFactory).toBe(
      blindCharacteristicsFactory,
    );
  });
  it('should provide blind observer factory', () => {
    const container = new Container(platform);
    const blindObserverFactory = container.blindObserverFactory;

    expect(blindObserverFactory).toBeInstanceOf(BlindObserverFactory);
    expect(container.blindObserverFactory).toBe(blindObserverFactory);
  });
  it('should provide client', () => {
    const container = new Container(platform);
    const client = container.client;

    expect(client).toBeInstanceOf(Client);
    expect(container.client).toBe(client);
  });
  it('should provide memory cache with custom TTL as client cache', () => {
    platform.config.ttl = 10;

    const container = new Container(platform);
    const clientCache = container.clientCache;

    expect(clientCache).toBeInstanceOf(MemoryCache);
    expect(container.clientCache).toBe(clientCache);
  });
  it('should provide local connection as client connection', () => {
    const container = new Container(platform);
    const clientConnection = container.clientConnection;

    expect(clientConnection).toBeInstanceOf(LocalConnection);
    expect(container.clientConnection).toBe(clientConnection);
  });
  it('should provide heartbeat', () => {
    const container = new Container(platform);
    const heartbeat = container.heartbeat;

    expect(heartbeat).toBeInstanceOf(Interval);
    expect(container.heartbeat).toBe(heartbeat);
  });
  it('should provide heartbeat with custom interval', () => {
    platform.config.interval = 10;

    const container = new Container(platform);

    expect(container.heartbeat.interval).toBe(10000);
  });
  it('should provide meteo temperature accessory factory', () => {
    const container = new Container(platform);
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
    const container = new Container(platform);
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
    const container = new Container(platform);
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
    const container = new Container(platform);
    const queryAPI = container.queryAPI;

    expect(queryAPI).toBeInstanceOf(QueryAPI);
    expect(container.queryAPI).toBe(queryAPI);
  });
});
