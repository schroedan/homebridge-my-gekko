import {
  API,
  Categories,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service as PlatformService,
} from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import { BlindAPI, QueryAPI } from '../api';
import { PlatformEventEmitter } from '../platform-events';
import { BlindCharacteristics } from './blind.characteristics';
import { BlindCharacteristicsFactory } from './blind.characteristics.factory';

describe('Blind Characteristics Factory', () => {
  let api: MockProxy<API>;
  let queryAPI: MockProxy<QueryAPI>;
  let config: MockProxy<PlatformConfig>;
  let logger: MockProxy<Logging>;
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  beforeEach(() => {
    api = mock<API>({
      hap: {
        Service: mock<typeof PlatformService>(),
      },
    });
    queryAPI = mock<QueryAPI>();
    config = mock<PlatformConfig>();
    logger = mock<Logging>();
    eventEmitter = mock<PlatformEventEmitter>();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should reject creation of characteristics for invalid service', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    const factory = new BlindCharacteristicsFactory(
      api,
      queryAPI,
      config,
      logger,
      eventEmitter,
    );

    await expect(factory.createCharacteristics(accessory)).rejects.toThrow(
      'Service not found.',
    );
  });
  it('should reject creation of characteristics for invalid blind', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    accessory.getService.mockReturnValue(mock<PlatformService>());

    const factory = new BlindCharacteristicsFactory(
      api,
      queryAPI,
      config,
      logger,
      eventEmitter,
    );

    await expect(factory.createCharacteristics(accessory)).rejects.toThrow(
      'Blind not found.',
    );
  });
  it('should create characteristics', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    accessory.getService.mockReturnValue(mock<PlatformService>());
    queryAPI.getBlind.mockResolvedValue(mock<BlindAPI>());

    const factory = new BlindCharacteristicsFactory(
      api,
      queryAPI,
      config,
      logger,
      eventEmitter,
    );

    await expect(
      factory.createCharacteristics(accessory),
    ).resolves.toBeInstanceOf(BlindCharacteristics);
  });
});
