import { AxiosCacheInstance } from 'axios-cache-interceptor';
import { MockProxy, mock } from 'jest-mock-extended';

import { DeepPartial } from './deep-partial';

export const mockAxiosCacheInstance = (
  props?: DeepPartial<AxiosCacheInstance>,
): MockProxy<AxiosCacheInstance> => mock<AxiosCacheInstance>(props);
