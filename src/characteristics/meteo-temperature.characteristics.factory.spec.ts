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
import { MeteoTemperatureCharacteristics } from './meteo-temperature.characteristics';
import { MeteoTemperatureCharacteristicsFactory } from './meteo-temperature.characteristics.factory';

describe('Meteo Temperature Characteristics Factory', () => {
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

    const meteoTemperature = new MeteoTemperatureCharacteristicsFactory(
      api,
      queryAPI,
    );

    await expect(
      meteoTemperature.createCharacteristics(accessory),
    ).rejects.toThrow('Service not found.');
  });
  it('should reject creation of characteristics for invalid meteo', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.getService.mockReturnValue(mockService());

    const meteoTemperature = new MeteoTemperatureCharacteristicsFactory(
      api,
      queryAPI,
    );

    await expect(
      meteoTemperature.createCharacteristics(accessory),
    ).rejects.toThrow('Meteo not found.');
  });
  it('should create characteristics', async () => {
    const accessory = mockPlatformAccessory({
      category: Categories.OTHER,
    });

    accessory.getService.mockReturnValue(mockService());
    queryAPI.getMeteo.mockResolvedValue(mockMeteoAPI());

    const meteoTemperature = new MeteoTemperatureCharacteristicsFactory(
      api,
      queryAPI,
    );

    await expect(
      meteoTemperature.createCharacteristics(accessory),
    ).resolves.toBeInstanceOf(MeteoTemperatureCharacteristics);
  });
});
