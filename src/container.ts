import { API, Logging, PlatformConfig } from 'homebridge';

import {
  BlindAccessoryFactory,
  MeteoBrightnessAccessoryFactory,
  MeteoTemperatureAccessoryFactory,
} from './accessory';
import {
  LocalQueryAPIClient,
  PlusQueryAPIClient,
  QueryAPI,
  QueryAPIClient,
} from './api';
import {
  BlindCharacteristicsFactory,
  MeteoBrightnessCharacteristicsFactory,
  MeteoTemperatureCharacteristicsFactory,
} from './characteristics';
import { Interval } from './interval';
import {
  BlindObserverFactory,
  MeteoBrightnessObserverFactory,
  MeteoTemperatureObserverFactory,
} from './observer';
import { PlatformEventEmitter } from './platform-events';
import { UUID } from './uuid';

export class Container {
  private _blindAccessoryFactory?: BlindAccessoryFactory;
  private _blindCharacteristicsFactory?: BlindCharacteristicsFactory;
  private _blindObserverFactory?: BlindObserverFactory;
  private _config: PlatformConfig;
  private _eventEmitter?: PlatformEventEmitter;
  private _heartbeat?: Interval<() => void>;
  private _meteoBrightnessAccessoryFactory?: MeteoBrightnessAccessoryFactory;
  private _meteoBrightnessCharacteristicsFactory?: MeteoBrightnessCharacteristicsFactory;
  private _meteoBrightnessObserverFactory?: MeteoBrightnessObserverFactory;
  private _meteoTemperatureAccessoryFactory?: MeteoTemperatureAccessoryFactory;
  private _meteoTemperatureCharacteristicsFactory?: MeteoTemperatureCharacteristicsFactory;
  private _meteoTemperatureObserverFactory?: MeteoTemperatureObserverFactory;
  private _queryAPI?: QueryAPI;
  private _queryAPIClient?: QueryAPIClient;
  private _uuid?: UUID;

  constructor(
    config: PlatformConfig,
    readonly logger: Logging,
    readonly api: API,
  ) {
    this._config = Object.assign(
      {
        name: 'myGEKKO',
        blinds: true,
        meteo: true,
        ttl: 1,
        interval: 3,
        deferance: 10,
        delay: 500,
      },
      config,
    );
  }

  get blindAccessoryFactory(): BlindAccessoryFactory {
    if (this._blindAccessoryFactory === undefined) {
      this._blindAccessoryFactory = new BlindAccessoryFactory(
        this.api,
        this.uuid,
      );
    }

    return this._blindAccessoryFactory;
  }

  get blindCharacteristicsFactory(): BlindCharacteristicsFactory {
    if (this._blindCharacteristicsFactory === undefined) {
      this._blindCharacteristicsFactory = new BlindCharacteristicsFactory(
        this.api,
        this.queryAPI,
        this.config,
        this.logger,
        this.eventEmitter,
      );
    }

    return this._blindCharacteristicsFactory;
  }

  get blindObserverFactory(): BlindObserverFactory {
    if (this._blindObserverFactory === undefined) {
      this._blindObserverFactory = new BlindObserverFactory(
        this.eventEmitter,
        this.logger,
        this.heartbeat,
        this.config,
      );
    }

    return this._blindObserverFactory;
  }

  get config(): PlatformConfig {
    return this._config;
  }

  get eventEmitter(): PlatformEventEmitter {
    if (this._eventEmitter === undefined) {
      this._eventEmitter = new PlatformEventEmitter();
    }

    return this._eventEmitter;
  }

  get heartbeat(): Interval<() => void> {
    if (this._heartbeat === undefined) {
      this._heartbeat = new Interval(this.config.interval * 1000);
    }

    return this._heartbeat;
  }

  get meteoBrightnessAccessoryFactory(): MeteoBrightnessAccessoryFactory {
    if (this._meteoBrightnessAccessoryFactory === undefined) {
      this._meteoBrightnessAccessoryFactory =
        new MeteoBrightnessAccessoryFactory(this.api, this.uuid);
    }

    return this._meteoBrightnessAccessoryFactory;
  }

  get meteoBrightnessCharacteristicsFactory(): MeteoBrightnessCharacteristicsFactory {
    if (this._meteoBrightnessCharacteristicsFactory === undefined) {
      this._meteoBrightnessCharacteristicsFactory =
        new MeteoBrightnessCharacteristicsFactory(this.api, this.queryAPI);
    }

    return this._meteoBrightnessCharacteristicsFactory;
  }

  get meteoBrightnessObserverFactory(): MeteoBrightnessObserverFactory {
    if (this._meteoBrightnessObserverFactory === undefined) {
      this._meteoBrightnessObserverFactory = new MeteoBrightnessObserverFactory(
        this.eventEmitter,
        this.logger,
      );
    }

    return this._meteoBrightnessObserverFactory;
  }

  get meteoTemperatureAccessoryFactory(): MeteoTemperatureAccessoryFactory {
    if (this._meteoTemperatureAccessoryFactory === undefined) {
      this._meteoTemperatureAccessoryFactory =
        new MeteoTemperatureAccessoryFactory(this.api, this.uuid);
    }

    return this._meteoTemperatureAccessoryFactory;
  }

  get meteoTemperatureCharacteristicsFactory(): MeteoTemperatureCharacteristicsFactory {
    if (this._meteoTemperatureCharacteristicsFactory === undefined) {
      this._meteoTemperatureCharacteristicsFactory =
        new MeteoTemperatureCharacteristicsFactory(this.api, this.queryAPI);
    }

    return this._meteoTemperatureCharacteristicsFactory;
  }

  get meteoTemperatureObserverFactory(): MeteoTemperatureObserverFactory {
    if (this._meteoTemperatureObserverFactory === undefined) {
      this._meteoTemperatureObserverFactory =
        new MeteoTemperatureObserverFactory(this.eventEmitter, this.logger);
    }

    return this._meteoTemperatureObserverFactory;
  }

  get queryAPI(): QueryAPI {
    if (this._queryAPI === undefined) {
      this._queryAPI = new QueryAPI(this.queryAPIClient);
    }

    return this._queryAPI;
  }

  get queryAPIClient(): QueryAPIClient {
    if (this._queryAPIClient === undefined) {
      if (this.config.plus) {
        this._queryAPIClient = new PlusQueryAPIClient({
          username: this.config.username,
          key: this.config.key,
          gekkoid: this.config.gekkoid,
        });
      } else {
        this._queryAPIClient = new LocalQueryAPIClient({
          host: this.config.host,
          username: this.config.username,
          password: this.config.password,
        });
      }
    }

    return this._queryAPIClient;
  }

  get uuid(): UUID {
    if (this._uuid === undefined) {
      this._uuid = new UUID(this.api);
    }

    return this._uuid;
  }
}
