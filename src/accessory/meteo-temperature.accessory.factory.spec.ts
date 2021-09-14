import { PlatformAccessory, Service as PlatformService } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { Container } from '../container';
import { MeteoTemperatureAccessoryFactory } from './meteo-temperature.accessory.factory';

describe('Meteo Temperature Accessory Factory', () => {
  let container: MockProxy<Container>;
  beforeEach(() => {
    container = mock<Container>({
      platform: {
        api: {
          hap: {
            Service: mock<typeof PlatformService>(),
          },
          platformAccessory: jest
            .fn()
            .mockImplementation(() =>
              mock<PlatformAccessory>(),
            ) as unknown as typeof PlatformAccessory,
        },
      },
    });
  });
  it('should create accessory', async () => {
    const meteoTemperature = new MeteoTemperatureAccessoryFactory(container);
    const accessory = await meteoTemperature.createAccessory();

    expect(accessory.context.type).toEqual('meteo-temperature');
  });
});
