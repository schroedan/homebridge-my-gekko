import {
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { API as QueryAPI, Meteo as MeteoAPI } from '../api';
import { Container } from '../container';
import { MeteoTemperatureCharacteristics } from './meteo-temperature.characteristics';
import { MeteoTemperatureCharacteristicsFactory } from './meteo-temperature.characteristics.factory';

describe('Meteo Temperature Characteristics Factory', () => {
  let queryAPI: MockProxy<QueryAPI>;
  let container: MockProxy<Container>;
  beforeEach(() => {
    queryAPI = mock<QueryAPI>();
    container = mock<Container>({
      platform: {
        api: {
          hap: {
            Service: mock<typeof PlatformService>(),
          },
        },
      },
      queryAPI,
    });
  });
  it('should reject creation of characteristics for invalid service', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.OTHER,
    });

    const meteoTemperature = new MeteoTemperatureCharacteristicsFactory(
      container,
    );

    await expect(
      meteoTemperature.createCharacteristics(accessory),
    ).rejects.toThrow('Service not found.');
  });
  it('should reject creation of characteristics for invalid meteo', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.OTHER,
    });

    accessory.getService.mockReturnValue(mock<PlatformService>());

    const meteoTemperature = new MeteoTemperatureCharacteristicsFactory(
      container,
    );

    await expect(
      meteoTemperature.createCharacteristics(accessory),
    ).rejects.toThrow('Meteo not found.');
  });
  it('should create characteristics', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.OTHER,
    });

    accessory.getService.mockReturnValue(mock<PlatformService>());
    queryAPI.getMeteo.mockResolvedValue(mock<MeteoAPI>());

    const meteoTemperature = new MeteoTemperatureCharacteristicsFactory(
      container,
    );

    await expect(
      meteoTemperature.createCharacteristics(accessory),
    ).resolves.toBeInstanceOf(MeteoTemperatureCharacteristics);
  });
});
