import { MockProxy, mock } from 'jest-mock-extended';

import {
  BlindAPI,
  LocalQueryAPIConfig,
  MeteoAPI,
  PlusQueryAPIConfig,
  QueryAPI,
  QueryAPIClient,
  Resources,
  Status,
} from '../../api';
import { DeepPartial } from './deep-partial';

export const mockBlindAPI = (
  props?: DeepPartial<BlindAPI>,
): MockProxy<BlindAPI> => mock<BlindAPI>(props);

export const mockLocalQueryAPIConfig = (
  props?: DeepPartial<LocalQueryAPIConfig>,
): MockProxy<LocalQueryAPIConfig> => mock<LocalQueryAPIConfig>(props);

export const mockMeteoAPI = (
  props?: DeepPartial<MeteoAPI>,
): MockProxy<MeteoAPI> => mock<MeteoAPI>(props);

export const mockPlusQueryAPIConfig = (
  props?: DeepPartial<PlusQueryAPIConfig>,
): MockProxy<PlusQueryAPIConfig> => mock<PlusQueryAPIConfig>(props);

export const mockQueryAPI = (
  props?: DeepPartial<QueryAPI>,
): MockProxy<QueryAPI> => mock<QueryAPI>(props);

export const mockQueryAPIClient = (
  props?: DeepPartial<QueryAPIClient>,
): MockProxy<QueryAPIClient> => mock<QueryAPIClient>(props);

export const mockResources = (
  props?: DeepPartial<Resources>,
): MockProxy<Resources> => mock<Resources>(props);

export const mockStatus = (props?: DeepPartial<Status>): MockProxy<Status> =>
  mock<Status>(props);
