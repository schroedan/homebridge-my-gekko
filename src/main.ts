import { API } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_IDENTIFIER, Platform } from './platform';

export default (api: API): void => {
  api.registerPlatform(PLUGIN_IDENTIFIER, PLATFORM_NAME, Platform);
};
