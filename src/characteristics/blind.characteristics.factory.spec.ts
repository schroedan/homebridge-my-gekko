import {
  Categories,
  PlatformAccessory,
  Service as PlatformService,
} from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { API as QueryAPI, Blind as BlindAPI } from '../api';
import { Container } from '../container';
import { BlindCharacteristics as BlindCharacteristics } from './blind.characteristics';
import { BlindCharacteristicsFactory } from './blind.characteristics.factory';

describe('Blind Characteristics Factory', () => {
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
      category: Categories.WINDOW_COVERING,
    });

    const blind = new BlindCharacteristicsFactory(container);

    await expect(blind.createCharacteristics(accessory)).rejects.toThrow(
      'Service not found.',
    );
  });
  it('should reject creation of characteristics for invalid blind', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    accessory.getService.mockReturnValue(mock<PlatformService>());

    const blind = new BlindCharacteristicsFactory(container);

    await expect(blind.createCharacteristics(accessory)).rejects.toThrow(
      'Blind not found.',
    );
  });
  it('should create characteristics', async () => {
    const accessory = mock<PlatformAccessory>({
      category: Categories.WINDOW_COVERING,
    });

    accessory.getService.mockReturnValue(mock<PlatformService>());
    queryAPI.getBlind.mockResolvedValue(mock<BlindAPI>());

    const blind = new BlindCharacteristicsFactory(container);

    await expect(
      blind.createCharacteristics(accessory),
    ).resolves.toBeInstanceOf(BlindCharacteristics);
  });
});
