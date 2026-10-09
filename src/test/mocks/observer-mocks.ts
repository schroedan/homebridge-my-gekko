import { MockProxy, mock } from 'jest-mock-extended';

import {
  BlindObserver,
  BlindObserverFactory,
  MeteoBrightnessObserver,
  MeteoBrightnessObserverFactory,
  MeteoTemperatureObserver,
  MeteoTemperatureObserverFactory,
} from '../../observer';
import { DeepPartial } from './deep-partial';

export const mockBlindObserver = (
  props?: DeepPartial<BlindObserver>,
): MockProxy<BlindObserver> => mock<BlindObserver>(props);

export const mockBlindObserverFactory = (
  props?: DeepPartial<BlindObserverFactory>,
): MockProxy<BlindObserverFactory> => mock<BlindObserverFactory>(props);

export const mockMeteoBrightnessObserver = (
  props?: DeepPartial<MeteoBrightnessObserver>,
): MockProxy<MeteoBrightnessObserver> => mock<MeteoBrightnessObserver>(props);

export const mockMeteoBrightnessObserverFactory = (
  props?: DeepPartial<MeteoBrightnessObserverFactory>,
): MockProxy<MeteoBrightnessObserverFactory> =>
  mock<MeteoBrightnessObserverFactory>(props);

export const mockMeteoTemperatureObserver = (
  props?: DeepPartial<MeteoTemperatureObserver>,
): MockProxy<MeteoTemperatureObserver> => mock<MeteoTemperatureObserver>(props);

export const mockMeteoTemperatureObserverFactory = (
  props?: DeepPartial<MeteoTemperatureObserverFactory>,
): MockProxy<MeteoTemperatureObserverFactory> =>
  mock<MeteoTemperatureObserverFactory>(props);
