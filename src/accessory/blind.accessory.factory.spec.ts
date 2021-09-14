import { PlatformAccessory, Service as PlatformService } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { Blind as BlindAPI } from '../api';
import { Container } from '../container';
import { BlindAccessoryFactory } from './blind.accessory.factory';

describe('Blind Accessory Factory', () => {
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
    const api = mock<BlindAPI>({
      key: '__key__',
    });

    api.getName.mockResolvedValue('__name__');

    const blind = new BlindAccessoryFactory(container);
    const accessory = await blind.createAccessory(api);

    expect(accessory.context.key).toEqual('__key__');
    expect(accessory.context.type).toEqual('blind');
  });
});
