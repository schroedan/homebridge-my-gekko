import { API } from 'homebridge';
import { MockProxy } from 'jest-mock-extended';

import main from './main';
import { PLATFORM_NAME, PLUGIN_IDENTIFIER, Platform } from './platform';
import { mockAPI } from './test/mocks';

describe('Main', () => {
  let api: MockProxy<API>;
  beforeEach(() => {
    api = mockAPI();
  });
  it('should register platform', () => {
    main(api);

    expect(api.registerPlatform).toHaveBeenCalledWith(
      PLUGIN_IDENTIFIER,
      PLATFORM_NAME,
      Platform,
    );
  });
});
