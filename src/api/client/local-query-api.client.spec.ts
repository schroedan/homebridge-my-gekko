import { mockLocalQueryAPIConfig } from '../../test/mocks';
import { LocalQueryAPIClient } from './local-query-api.client';
import * as queryAPIClient from './query-api.client';

describe('Local Query API Client', () => {
  it('should provide config', () => {
    const config = mockLocalQueryAPIConfig();
    const client = new LocalQueryAPIClient(config);

    expect(client.config).toBe(config);
  });
  it('should create instance with default ttl and retries', () => {
    const createInstance = jest.spyOn(queryAPIClient, 'createInstance');

    new LocalQueryAPIClient({});

    expect(createInstance).toHaveBeenCalledWith(
      expect.objectContaining({ ttl: 3000, retries: 3 }),
    );
  });
  it('should create instance with configured ttl and retries', () => {
    const createInstance = jest.spyOn(queryAPIClient, 'createInstance');

    new LocalQueryAPIClient({ ttl: 0, retries: 0 });

    expect(createInstance).toHaveBeenCalledWith(
      expect.objectContaining({ ttl: 0, retries: 0 }),
    );
  });
});
