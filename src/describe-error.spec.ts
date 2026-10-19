import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

import { describeError } from './describe-error';

describe('Describe Error', () => {
  const config = {
    baseURL: 'http://mygekko/api/v1',
    url: '/var/blinds/item0/scmd/set?value=P50',
    method: 'get',
    params: { username: '__username__', key: '__key__' },
    headers: new AxiosHeaders(),
  } as InternalAxiosRequestConfig;

  it('should describe axios errors with response', () => {
    const error = new AxiosError(
      'Request failed with status code 403',
      'ERR_BAD_REQUEST',
      config,
      undefined,
      {
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config,
        data: '',
      },
    );

    expect(describeError(error)).toBe(
      'Request failed with status code 403 (HTTP 403): GET http://mygekko/api/v1/var/blinds/item0/scmd/set',
    );
  });
  it('should describe axios errors without response', () => {
    const error = new AxiosError(
      'timeout of 10000ms exceeded',
      'ECONNABORTED',
      {
        ...config,
        baseURL: undefined,
        method: undefined,
      } as InternalAxiosRequestConfig,
    );

    expect(describeError(error)).toBe(
      'timeout of 10000ms exceeded: GET /var/blinds/item0/scmd/set',
    );
  });
  it('should describe axios errors without config', () => {
    expect(describeError(new AxiosError('Network Error'))).toBe(
      'Network Error',
    );
  });
  it('should not describe credentials', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK', config);

    expect(describeError(error)).not.toContain('__key__');
    expect(describeError(error)).not.toContain('__username__');
  });
  it('should describe errors', () => {
    expect(describeError(new Error('__message__'))).toBe('__message__');
  });
  it('should describe other reasons', () => {
    expect(describeError('__reason__')).toBe('__reason__');
  });
});
