import { API } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';

import main from './main';
import { Platform, PLATFORM_NAME, PLUGIN_IDENTIFIER } from './platform';

describe('Main', () => {
  let api: MockProxy<API>;
  beforeEach(() => {
    api = mock<API>();
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
