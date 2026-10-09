import { MockProxy, mock } from 'jest-mock-extended';

import {
  BlindCharacteristics,
  BlindCharacteristicsFactory,
  MeteoBrightnessCharacteristics,
  MeteoBrightnessCharacteristicsFactory,
  MeteoTemperatureCharacteristics,
  MeteoTemperatureCharacteristicsFactory,
} from '../../characteristics';
import { DeepPartial } from './deep-partial';

export const mockBlindCharacteristics = (
  props?: DeepPartial<BlindCharacteristics>,
): MockProxy<BlindCharacteristics> => mock<BlindCharacteristics>(props);

export const mockBlindCharacteristicsFactory = (
  props?: DeepPartial<BlindCharacteristicsFactory>,
): MockProxy<BlindCharacteristicsFactory> =>
  mock<BlindCharacteristicsFactory>(props);

export const mockMeteoBrightnessCharacteristics = (
  props?: DeepPartial<MeteoBrightnessCharacteristics>,
): MockProxy<MeteoBrightnessCharacteristics> =>
  mock<MeteoBrightnessCharacteristics>(props);

export const mockMeteoBrightnessCharacteristicsFactory = (
  props?: DeepPartial<MeteoBrightnessCharacteristicsFactory>,
): MockProxy<MeteoBrightnessCharacteristicsFactory> =>
  mock<MeteoBrightnessCharacteristicsFactory>(props);

export const mockMeteoTemperatureCharacteristics = (
  props?: DeepPartial<MeteoTemperatureCharacteristics>,
): MockProxy<MeteoTemperatureCharacteristics> =>
  mock<MeteoTemperatureCharacteristics>(props);

export const mockMeteoTemperatureCharacteristicsFactory = (
  props?: DeepPartial<MeteoTemperatureCharacteristicsFactory>,
): MockProxy<MeteoTemperatureCharacteristicsFactory> =>
  mock<MeteoTemperatureCharacteristicsFactory>(props);
