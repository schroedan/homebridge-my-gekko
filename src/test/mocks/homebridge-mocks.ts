import {
  API,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service as PlatformService,
  Characteristic as ServiceCharacteristic,
} from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import { DeepPartial } from './deep-partial';

export const mockAPI = (props?: DeepPartial<API>): MockProxy<API> =>
  mock<API>(props);

export const mockCharacteristic = (
  props?: DeepPartial<ServiceCharacteristic>,
): MockProxy<ServiceCharacteristic> => mock<ServiceCharacteristic>(props);

export const mockCharacteristicClass = (
  props?: DeepPartial<typeof ServiceCharacteristic>,
): MockProxy<typeof ServiceCharacteristic> =>
  mock<typeof ServiceCharacteristic>(props);

export const mockLogging = (props?: DeepPartial<Logging>): MockProxy<Logging> =>
  mock<Logging>(props);

export const mockPlatformAccessory = (
  props?: DeepPartial<PlatformAccessory>,
): MockProxy<PlatformAccessory> => mock<PlatformAccessory>(props);

export const mockPlatformConfig = (
  props?: DeepPartial<PlatformConfig>,
): MockProxy<PlatformConfig> => mock<PlatformConfig>(props);

export const mockService = (
  props?: DeepPartial<PlatformService>,
): MockProxy<PlatformService> => mock<PlatformService>(props);

export const mockServiceClass = (
  props?: DeepPartial<typeof PlatformService>,
): MockProxy<typeof PlatformService> => mock<typeof PlatformService>(props);
