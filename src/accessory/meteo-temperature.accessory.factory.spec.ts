import { API, PlatformAccessory, Service as PlatformService } from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import { UUID } from '../uuid';
import { MeteoTemperatureAccessoryFactory } from './meteo-temperature.accessory.factory';

describe('Meteo Temperature Accessory Factory', () => {
  let api: MockProxy<API>;
  let uuid: MockProxy<UUID>;
  beforeEach(() => {
    api = mock<API>({
      hap: {
        Service: mock<typeof PlatformService>(),
      },
      platformAccessory: jest
        .fn()
        .mockImplementation(() =>
          mock<PlatformAccessory>(),
        ) as unknown as typeof PlatformAccessory,
    });
    uuid = mock<UUID>();
  });
  it('should create accessory', async () => {
    const factory = new MeteoTemperatureAccessoryFactory(api, uuid);
    const accessory = await factory.createAccessory();

    expect(accessory.context.type).toEqual('meteo-temperature');
  });
});
