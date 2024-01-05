import { mock } from 'jest-mock-extended';

import {
  PlusQueryAPIClient,
  PlusQueryAPIConfig,
} from './plus-query-api.client';

describe('Plus Query API Client', () => {
  it('should provide config', () => {
    const config = mock<PlusQueryAPIConfig>();
    const client = new PlusQueryAPIClient(config);

    expect(client.config).toBe(config);
  });
});
