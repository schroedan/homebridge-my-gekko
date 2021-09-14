import {
  BlindAccessoryFactory,
  MeteoTemperatureAccessoryFactory,
} from './accessory';
import {
  API as QueryAPI,
  Cache,
  Client,
  Connection,
  LocalConnection,
  MemoryCache,
} from './api';
import {
  BlindCharacteristicsFactory,
  MeteoTemperatureCharacteristicsFactory,
} from './characteristics';
import { Interval } from './interval';
import {
  BlindObserverFactory,
  MeteoTemperatureObserverFactory,
} from './observer';
import { Platform } from './platform';

export class Container {
  private _blindAccessoryFactory?: BlindAccessoryFactory;
  private _blindCharacteristicsFactory?: BlindCharacteristicsFactory;
  private _blindObserverFactory?: BlindObserverFactory;
  private _client?: Client;
  private _clientCache?: Cache;
  private _clientConnection?: Connection;
  private _heartbeat?: Interval<() => void>;
  private _meteoTemperatureAccessoryFactory?: MeteoTemperatureAccessoryFactory;
  private _meteoTemperatureCharacteristicsFactory?: MeteoTemperatureCharacteristicsFactory;
  private _meteoTemperatureObserverFactory?: MeteoTemperatureObserverFactory;
  private _queryAPI?: QueryAPI;

  constructor(readonly platform: Platform) {}

  get blindAccessoryFactory(): BlindAccessoryFactory {
    if (this._blindAccessoryFactory === undefined) {
      this._blindAccessoryFactory = new BlindAccessoryFactory(this);
    }

    return this._blindAccessoryFactory;
  }

  get blindCharacteristicsFactory(): BlindCharacteristicsFactory {
    if (this._blindCharacteristicsFactory === undefined) {
      this._blindCharacteristicsFactory = new BlindCharacteristicsFactory(this);
    }

    return this._blindCharacteristicsFactory;
  }

  get blindObserverFactory(): BlindObserverFactory {
    if (this._blindObserverFactory === undefined) {
      this._blindObserverFactory = new BlindObserverFactory(this);
    }

    return this._blindObserverFactory;
  }

  get client(): Client {
    if (this._client === undefined) {
      this._client = new Client(this.clientConnection);
      this._client.useCache(this.clientCache);
    }

    return this._client;
  }

  get clientCache(): Cache {
    if (this._clientCache === undefined) {
      // ToDo: support different cache backends
      this._clientCache = new MemoryCache({
        ttl: this.platform.config.ttl ?? 3,
      });
    }

    return this._clientCache;
  }

  get clientConnection(): Connection {
    if (this._clientConnection === undefined) {
      // ToDo: make connection configurable
      this._clientConnection = new LocalConnection({
        host: this.platform.config.host,
        username: this.platform.config.username,
        password: this.platform.config.password,
      });
    }

    return this._clientConnection;
  }

  get heartbeat(): Interval<() => void> {
    if (this._heartbeat === undefined) {
      this._heartbeat = new Interval(
        (this.platform.config.interval ?? 3) * 1000,
      );
    }

    return this._heartbeat;
  }

  get meteoTemperatureAccessoryFactory(): MeteoTemperatureAccessoryFactory {
    if (this._meteoTemperatureAccessoryFactory === undefined) {
      this._meteoTemperatureAccessoryFactory =
        new MeteoTemperatureAccessoryFactory(this);
    }

    return this._meteoTemperatureAccessoryFactory;
  }

  get meteoTemperatureCharacteristicsFactory(): MeteoTemperatureCharacteristicsFactory {
    if (this._meteoTemperatureCharacteristicsFactory === undefined) {
      this._meteoTemperatureCharacteristicsFactory =
        new MeteoTemperatureCharacteristicsFactory(this);
    }

    return this._meteoTemperatureCharacteristicsFactory;
  }

  get meteoTemperatureObserverFactory(): MeteoTemperatureObserverFactory {
    if (this._meteoTemperatureObserverFactory === undefined) {
      this._meteoTemperatureObserverFactory =
        new MeteoTemperatureObserverFactory(this);
    }

    return this._meteoTemperatureObserverFactory;
  }

  get queryAPI(): QueryAPI {
    if (this._queryAPI === undefined) {
      this._queryAPI = new QueryAPI(this.client);
    }

    return this._queryAPI;
  }
}
