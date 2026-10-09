import { MockProxy, mock } from 'jest-mock-extended';

import {
  BlindAccessoryFactory,
  MeteoBrightnessAccessoryFactory,
  MeteoTemperatureAccessoryFactory,
} from '../../accessory';
import { DeepPartial } from './deep-partial';

export const mockBlindAccessoryFactory = (
  props?: DeepPartial<BlindAccessoryFactory>,
): MockProxy<BlindAccessoryFactory> => mock<BlindAccessoryFactory>(props);

export const mockMeteoBrightnessAccessoryFactory = (
  props?: DeepPartial<MeteoBrightnessAccessoryFactory>,
): MockProxy<MeteoBrightnessAccessoryFactory> =>
  mock<MeteoBrightnessAccessoryFactory>(props);

export const mockMeteoTemperatureAccessoryFactory = (
  props?: DeepPartial<MeteoTemperatureAccessoryFactory>,
): MockProxy<MeteoTemperatureAccessoryFactory> =>
  mock<MeteoTemperatureAccessoryFactory>(props);
