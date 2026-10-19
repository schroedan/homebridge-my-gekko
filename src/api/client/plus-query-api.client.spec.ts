import { mockPlusQueryAPIConfig } from '../../test/mocks';
import { PlusQueryAPIClient } from './plus-query-api.client';
import * as queryAPIClient from './query-api.client';

describe('Plus Query API Client', () => {
  it('should provide config', () => {
    const config = mockPlusQueryAPIConfig();
    const client = new PlusQueryAPIClient(config);

    expect(client.config).toBe(config);
  });
  it('should create instance with default ttl and retries', () => {
    const createInstance = jest.spyOn(queryAPIClient, 'createInstance');

    new PlusQueryAPIClient({});

    expect(createInstance).toHaveBeenCalledWith(
      expect.objectContaining({ ttl: 3000, retries: 3 }),
    );
  });
  it('should create instance with configured ttl and retries', () => {
    const createInstance = jest.spyOn(queryAPIClient, 'createInstance');

    new PlusQueryAPIClient({ ttl: 0, retries: 0 });

    expect(createInstance).toHaveBeenCalledWith(
      expect.objectContaining({ ttl: 0, retries: 0 }),
    );
  });
});
