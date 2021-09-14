import { mock } from 'jest-mock-extended';
import { URL } from 'url';
import { Connection } from '../connection';
import { ReadRequest } from './read-request';

describe('Read request', () => {
  it('should provide connection', () => {
    const connection = mock<Connection>();
    const request = new ReadRequest(connection);

    expect(request.connection).toBe(connection);
  });
  it('should build default query URL', () => {
    const connection = mock<Connection>();
    const request = new ReadRequest(connection);

    connection.url.mockReturnValue(new URL('http://__host__/__path__'));

    expect(request.url().toString()).toEqual('http://__host__/__path__/');
  });
  it('should build custom query URL', () => {
    const connection = mock<Connection>();
    const request = new ReadRequest(connection);

    connection.url.mockReturnValue(new URL('http://__host__/__path__'));

    expect(request.withPath('/resource').url().toString()).toEqual(
      'http://__host__/__path__/resource',
    );
  });
});
