import { mock } from 'jest-mock-extended';
import { Cache } from './cache';
import { Client } from './client';
import { Connection } from './connection';
import * as queryService from './query';

jest.mock('./query');

describe('Client', () => {
  const cachedSpy = jest.spyOn(queryService, 'cached');
  const uncachedSpy = jest.spyOn(queryService, 'uncached');
  beforeEach(() => {
    cachedSpy.mockClear();
    uncachedSpy.mockClear();
  });
  it('should provide connection', () => {
    const connection = mock<Connection>();
    const client = new Client(connection);

    expect(client.connection).toBe(connection);
  });
  it('should execute cached query for read request', () => {
    const connection = mock<Connection>();
    const client = new Client(connection);

    client.useCache(mock<Cache>());
    client.query(client.readRequest());

    expect(cachedSpy).toHaveBeenCalledTimes(1);
    expect(uncachedSpy).not.toHaveBeenCalled();
  });
  it('should execute uncached query for write request', () => {
    const connection = mock<Connection>();
    const client = new Client(connection);

    client.useCache(mock<Cache>());
    client.query(client.writeRequest());

    expect(cachedSpy).not.toHaveBeenCalled();
    expect(uncachedSpy).toHaveBeenCalledTimes(1);
  });
  it('should execute uncached query when cache was not passed', () => {
    const connection = mock<Connection>();
    const client = new Client(connection);

    client.query(client.readRequest());

    expect(cachedSpy).not.toHaveBeenCalled();
    expect(uncachedSpy).toHaveBeenCalledTimes(1);
  });
});
