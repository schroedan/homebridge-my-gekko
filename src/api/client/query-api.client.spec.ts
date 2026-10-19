import { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { createInstance } from './query-api.client';

type Adapter = (config: InternalAxiosRequestConfig) => Promise<never>;

function failingAdapter(): jest.Mock<ReturnType<Adapter>, Parameters<Adapter>> {
  return jest.fn((config: InternalAxiosRequestConfig) =>
    Promise.reject(
      new AxiosError('Service Unavailable', 'ERR_BAD_RESPONSE', config, null, {
        data: '',
        status: 503,
        statusText: 'Service Unavailable',
        headers: {},
        config,
      }),
    ),
  );
}

describe('Query API Client', () => {
  it('should create instance', () => {
    const instance = createInstance({
      auth: { username: '__username__', password: '__password__' },
      baseURL: 'http://mygekko/api/v1',
      params: { key: '__key__' },
      ttl: 1000,
      retries: 3,
    });

    expect(instance.defaults.auth).toEqual({
      username: '__username__',
      password: '__password__',
    });
    expect(instance.defaults.baseURL).toBe('http://mygekko/api/v1');
    expect(instance.defaults.params).toEqual({ key: '__key__' });
    expect(instance.defaults.cache.ttl).toBe(1000);
  });
  it('should time out hanging requests', () => {
    expect(createInstance({}).defaults.timeout).toBe(10000);
  });
  it('should retry failed requests', async () => {
    const instance = createInstance({ retries: 2 });
    const adapter = failingAdapter();

    instance.defaults.adapter = adapter;

    await expect(instance.get('/var/status')).rejects.toThrow();
    expect(adapter).toHaveBeenCalledTimes(3);
  });
  it('should not retry requests with disabled retries', async () => {
    const instance = createInstance({ retries: 2 });
    const adapter = failingAdapter();

    instance.defaults.adapter = adapter;

    await expect(
      instance.get('/var/blinds/item0/scmd/set', {
        cache: false,
        'axios-retry': { retries: 0 },
      }),
    ).rejects.toThrow();
    expect(adapter).toHaveBeenCalledTimes(1);
  });
  it('should not hang on cached requests after a failure', async () => {
    const instance = createInstance({ retries: 2 });
    const adapter = failingAdapter();

    instance.defaults.adapter = adapter;

    await expect(instance.get('/var/status')).rejects.toThrow();

    adapter.mockImplementation(
      (config) =>
        Promise.resolve({
          data: '__data__',
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }) as never,
    );

    await expect(instance.get('/var/status')).resolves.toHaveProperty(
      'data',
      '__data__',
    );
  });
});
