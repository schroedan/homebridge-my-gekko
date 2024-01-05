import { createInstance } from './query-api.client';

xdescribe('Query API Client', () => {
  it('should provide instance', () => {
    expect(createInstance({})).not.toThrow();
  });
});
