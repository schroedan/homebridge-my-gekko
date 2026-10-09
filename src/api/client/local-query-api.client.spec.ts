import { mockLocalQueryAPIConfig } from '../../test/mocks';
import { LocalQueryAPIClient } from './local-query-api.client';

describe('Local Query API Client', () => {
  it('should provide config', () => {
    const config = mockLocalQueryAPIConfig();
    const client = new LocalQueryAPIClient(config);

    expect(client.config).toBe(config);
  });
});
