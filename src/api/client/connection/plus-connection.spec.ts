import { PlusConnection } from './plus-connection';

describe('Plus connection', () => {
  it('should provide URL', () => {
    const connection = new PlusConnection({
      username: '__username__',
      key: '__key__',
      gekkoid: '__gekkoid__',
    });

    expect(connection.url().toString()).toBe(
      'https://live.my-gekko.com/api/v1?username=__username__&key=__key__&gekkoid=__gekkoid__',
    );
  });
});
