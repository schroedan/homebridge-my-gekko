import { API, Logging, PlatformConfig } from 'homebridge';
import { MockProxy } from 'jest-mock-extended';

import { QueryAPI } from '../api';
import { Categories } from '../categories';
import { PlatformEventEmitter } from '../platform-events';
import {
  mockAPI,
  mockBlindAPI,
  mockLogging,
  mockPlatformAccessory,
  mockPlatformConfig,
  mockPlatformEventEmitter,
  mockQueryAPI,
  mockService,
  mockServiceClass,
} from '../test/mocks';
import { BlindCharacteristics } from './blind.characteristics';
import { BlindCharacteristicsFactory } from './blind.characteristics.factory';

describe('Blind Characteristics Factory', () => {
  let api: MockProxy<API>;
  let queryAPI: MockProxy<QueryAPI>;
  let config: MockProxy<PlatformConfig>;
  let logger: MockProxy<Logging>;
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  beforeEach(() => {
    api = mockAPI({
      hap: {
        Service: mockServiceClass(),
      },
    });
    queryAPI = mockQueryAPI();
    config = mockPlatformConfig();
    logger = mockLogging();
    eventEmitter = mockPlatformEventEmitter();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should reject creation of characteristics for invalid service', async () => {
    const accessory = mockPlatformAccessory({
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
    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
    });

    accessory.getService.mockReturnValue(mockService());

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
    const accessory = mockPlatformAccessory({
      category: Categories.WINDOW_COVERING,
    });

    accessory.getService.mockReturnValue(mockService());
    queryAPI.getBlind.mockResolvedValue(mockBlindAPI());

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
