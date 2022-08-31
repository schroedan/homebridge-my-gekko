import { API, PlatformAccessory, Service as PlatformService } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { UUID } from '../uuid';
import { MeteoBrightnessAccessoryFactory } from './meteo-brightness.accessory.factory';

describe('Meteo Brightness Accessory Factory', () => {
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
    const factory = new MeteoBrightnessAccessoryFactory(api, uuid);
    const accessory = await factory.createAccessory();

    expect(accessory.context.type).toEqual('meteo-brightness');
  });
});
