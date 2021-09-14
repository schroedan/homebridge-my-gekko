import { LocalConnection } from './local-connection';

describe('Local connection', () => {
  it('should provide URL', () => {
    const connection = new LocalConnection({
      host: '__host__',
      username: '__username__',
      password: '__password__',
    });

    expect(connection.url().toString()).toBe(
      'http://__username__:__password__@__host__/api/v1',
    );
  });
});
