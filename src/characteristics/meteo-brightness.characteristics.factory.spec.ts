import {
  API,
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { MeteoAPI, QueryAPI } from '../api';
import { MeteoBrightnessCharacteristics } from './meteo-brightness.characteristics';
import { MeteoBrightnessCharacteristicsFactory } from './meteo-brightness.characteristics.factory';

describe('Meteo Brightness Characteristics Factory', () => {
  let api: MockProxy<API>;
  let queryAPI: MockProxy<QueryAPI>;
  beforeEach(() => {
    api = mock<API>({
      hap: {
        Service: mock<typeof PlatformService>(),
      },
    });
    queryAPI = mock<QueryAPI>();
  });
  it('should reject creation of characteristics for invalid service', async () => {
    const accessory = mock<PlatformAccessory>({
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
    const accessory = mock<PlatformAccessory>({
      category: Categories.OTHER,
    });

    accessory.getService.mockReturnValue(mock<PlatformService>());

    const meteoBrightness = new MeteoBrightnessCharacteristicsFactory(
      api,
      queryAPI,
    );

    await expect(
      meteoBrightness.createCharacteristics(accessory),
    ).rejects.toThrow('Meteo not found.');
  });
  it('should create characteristics', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.OTHER,
    });

    accessory.getService.mockReturnValue(mock<PlatformService>());
    queryAPI.getMeteo.mockResolvedValue(mock<MeteoAPI>());

    const meteoBrightness = new MeteoBrightnessCharacteristicsFactory(
      api,
      queryAPI,
    );

    await expect(
      meteoBrightness.createCharacteristics(accessory),
    ).resolves.toBeInstanceOf(MeteoBrightnessCharacteristics);
  });
});