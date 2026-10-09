import { API } from 'homebridge';
import { MockProxy } from 'jest-mock-extended';

import { QueryAPI } from '../api';
import { Categories } from '../categories';
import {
  mockAPI,
  mockMeteoAPI,
  mockPlatformAccessory,
  mockQueryAPI,
  mockService,
  mockServiceClass,
} from '../test/mocks';
import { MeteoBrightnessCharacteristics } from './meteo-brightness.characteristics';
import { MeteoBrightnessCharacteristicsFactory } from './meteo-brightness.characteristics.factory';

describe('Meteo Brightness Characteristics Factory', () => {
  let api: MockProxy<API>;
  let queryAPI: MockProxy<QueryAPI>;
  beforeEach(() => {
    api = mockAPI({
      hap: {
        Service: mockServiceClass(),
      },
    });
    queryAPI = mockQueryAPI();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should reject creation of characteristics for invalid service', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    const meteoBrightness = new MeteoBrightnessCharacteristicsFactory(
      api,
      queryAPI,
    );

    await expect(
      meteoBrightness.createCharacteristics(accessory),
    ).rejects.toThrow('Service not found.');
  });
  it('should reject creation of characteristics for invalid meteo', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.getService.mockReturnValue(mockService());

    const meteoBrightness = new MeteoBrightnessCharacteristicsFactory(
      api,
      queryAPI,
    );

    await expect(
      meteoBrightness.createCharacteristics(accessory),
    ).rejects.toThrow('Meteo not found.');
  });
  it('should create characteristics with default direction', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.getService.mockReturnValue(mockService());
    queryAPI.getMeteo.mockResolvedValue(mockMeteoAPI());

    const meteoBrightness = new MeteoBrightnessCharacteristicsFactory(
      api,
      queryAPI,
    );

    const characteristics =
      await meteoBrightness.createCharacteristics(accessory);

    expect(characteristics).toBeInstanceOf(MeteoBrightnessCharacteristics);
    expect(characteristics.direction).toBe('south');
  });
  it('should create characteristics with east direction', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
      context: {
        key: 'brightnesso',
      },
    });

    accessory.getService.mockReturnValue(mockService());
    queryAPI.getMeteo.mockResolvedValue(mockMeteoAPI());

    const meteoBrightness = new MeteoBrightnessCharacteristicsFactory(
      api,
      queryAPI,
    );

    const characteristics =
      await meteoBrightness.createCharacteristics(accessory);

    expect(characteristics).toBeInstanceOf(MeteoBrightnessCharacteristics);
    expect(characteristics.direction).toBe('east');
  });
  it('should create characteristics with default direction', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
      context: {
        key: 'brightnessw',
      },
    });

    accessory.getService.mockReturnValue(mockService());
    queryAPI.getMeteo.mockResolvedValue(mockMeteoAPI());

    const meteoBrightness = new MeteoBrightnessCharacteristicsFactory(
      api,
      queryAPI,
    );

    const characteristics =
      await meteoBrightness.createCharacteristics(accessory);

    expect(characteristics).toBeInstanceOf(MeteoBrightnessCharacteristics);
    expect(characteristics.direction).toBe('west');
  });
});
