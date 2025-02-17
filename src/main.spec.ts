import { API } from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import main from './main';
import { PLATFORM_NAME, PLUGIN_IDENTIFIER, Platform } from './platform';

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
