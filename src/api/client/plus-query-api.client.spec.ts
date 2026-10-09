import { mockPlusQueryAPIConfig } from '../../test/mocks';
import { PlusQueryAPIClient } from './plus-query-api.client';

describe('Plus Query API Client', () => {
  it('should provide config', () => {
    const config = mockPlusQueryAPIConfig();
    const client = new PlusQueryAPIClient(config);

    expect(client.config).toBe(config);
  });
});
