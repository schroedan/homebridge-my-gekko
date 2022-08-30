import * as httpService from 'http';
import { ClientRequest, IncomingMessage } from 'http';
import { mock } from 'jest-mock-extended';
import { URL } from 'url';
import { Request, Response } from '..';
import * as receiveService from '../receive';
import { uncached } from './uncached';

jest.mock('http');
jest.mock('../receive');

type httpFake = {
  get: (url: URL, callback: (res: IncomingMessage) => void) => ClientRequest;
};

describe('uncached query', () => {
  const getSpy = jest.spyOn(httpService as httpFake, 'get');
  const receiveSpy = jest.spyOn(receiveService, 'receive');
  beforeEach(() => {
    getSpy.mockClear();
    receiveSpy.mockClear();
  });
  it('should execute HTTP query and resolve response', async () => {
    const request = mock<Request>();
    const url = new URL('http://__host__/__path__/');

    request.url.mockReturnValue(url);

    const get = getSpy.mockImplementation((requestUrl, callback) => {
      expect(requestUrl).toBe(url);
      callback(mock<IncomingMessage>());
      return mock<ClientRequest>();
    });
    const receive = receiveSpy.mockResolvedValue('__data__');
    const promise = uncached(request);

    await expect(promise).resolves.toEqual(new Response(request, '__data__'));
    expect(receive).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
  });
  it('should execute HTTP query and reject receive error', async () => {
    const request = mock<Request>();
    const url = new URL('http://__host__/__path__/');

    request.url.mockReturnValue(url);

    const get = getSpy.mockImplementation((requestUrl, callback) => {
      expect(requestUrl).toBe(url);
      callback(mock<IncomingMessage>());
      return mock<ClientRequest>();
    });
    const receive = receiveSpy.mockRejectedValue('__error__');
    const promise = uncached(request);

    await expect(promise).rejects.toEqual('__error__');
    expect(receive).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
  });
});
