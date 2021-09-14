import { mock } from 'jest-mock-extended';
import { ReadRequest, Response } from '..';
import { Cache } from '../cache';
import { cached } from './cached';
import * as queryService from './uncached';

jest.mock('./uncached');

describe('cached query', () => {
  const uncachedSpy = jest.spyOn(queryService, 'uncached');
  beforeEach(() => {
    uncachedSpy.mockClear();
  });
  it('should return a cached response', async () => {
    const response = mock<Promise<Response>>();
    const cache = mock<Cache>();
    const request = mock<ReadRequest>();

    cache.get.mockReturnValue(response);

    const promise = cached(request, cache);

    await expect(promise).resolves.toEqual(response);
  });
  it('should execute HTTP query and return response', async () => {
    const response = mock<Promise<Response>>();
    const cache = mock<Cache>();
    const request = mock<ReadRequest>();

    const uncached = uncachedSpy.mockResolvedValue(response);
    const promise = cached(request, cache);

    await expect(promise).resolves.toEqual(response);
    expect(uncached).toBeCalledTimes(1);
  });
});
