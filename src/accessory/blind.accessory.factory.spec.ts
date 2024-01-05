import { API, PlatformAccessory, Service as PlatformService } from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import { BlindAPI } from '../api';
import { UUID } from '../uuid';
import { BlindAccessoryFactory } from './blind.accessory.factory';

describe('Blind Accessory Factory', () => {
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
    const blind = mock<BlindAPI>({
      key: '__key__',
    });

    blind.getName.mockResolvedValue('__name__');

    const factory = new BlindAccessoryFactory(api, uuid);
    const accessory = await factory.createAccessory(blind);

    expect(accessory.context.key).toEqual('__key__');
    expect(accessory.context.type).toEqual('blind');
  });
});
