import { mock } from 'jest-mock-extended';

import {
  LocalQueryAPIClient,
  LocalQueryAPIConfig,
} from './local-query-api.client';

describe('Local Query API Client', () => {
  it('should provide config', () => {
    const config = mock<LocalQueryAPIConfig>();
    const client = new LocalQueryAPIClient(config);

    expect(client.config).toBe(config);
  });
});
