import { API } from 'homebridge';
import { Platform, PLATFORM_NAME, PLUGIN_IDENTIFIER } from './platform';

export = (api: API) => {
    api.registerPlatform(PLUGIN_IDENTIFIER, PLATFORM_NAME, Platform);
};
