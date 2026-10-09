import { API, PlatformAccessory } from 'homebridge';
import { MockProxy } from 'jest-mock-extended';

import {
  mockAPI,
  mockPlatformAccessory,
  mockServiceClass,
  mockUUID,
} from '../test/mocks';
import { UUID } from '../uuid';
import { MeteoBrightnessAccessoryFactory } from './meteo-brightness.accessory.factory';

describe('Meteo Brightness Accessory Factory', () => {
  let api: MockProxy<API>;
  let uuid: MockProxy<UUID>;
  beforeEach(() => {
    api = mockAPI({
      hap: {
        Service: mockServiceClass(),
      },
      platformAccessory: jest
        .fn()
        .mockImplementation(() =>
          mockPlatformAccessory(),
        ) as unknown as typeof PlatformAccessory,
    });
    uuid = mockUUID();
  });
  it('should create accessory', () => {
    const factory = new MeteoBrightnessAccessoryFactory(api, uuid);
    const accessory = factory.createAccessory('__name__', '__key__');

    expect(accessory.context.key).toEqual('__key__');
    expect(accessory.context.type).toEqual('meteo-brightness');
  });
});
