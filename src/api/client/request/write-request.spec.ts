import { mock } from 'jest-mock-extended';
import { URL } from 'url';
import { Connection } from '../connection';
import { WriteRequest } from './write-request';

describe('Write request', () => {
  it('should provide connection', () => {
    const connection = mock<Connection>();
    const request = new WriteRequest(connection);

    expect(request.connection).toBe(connection);
  });
  it('should build default query URL', () => {
    const connection = mock<Connection>();
    const request = new WriteRequest(connection);

    connection.url.mockReturnValue(new URL('http://__host__/__path__'));

    expect(request.url().toString()).toEqual('http://__host__/__path__/');
  });
  it('should build custom query URL', () => {
    const connection = mock<Connection>();
    const request = new WriteRequest(connection);

    connection.url.mockReturnValue(new URL('http://__host__/__path__'));

    expect(
      request
        .withPath('/resource')
        .withParams([{ name: 'param', value: 'val' }])
        .url()
        .toString(),
    ).toEqual('http://__host__/__path__/resource?param=val');
  });
});
