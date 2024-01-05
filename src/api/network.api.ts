import { QueryAPI } from './query.api';

export type NetworkResource = any;

export type NetworkStatusValue = {
  value: string;
};

export type NetworkStatus = {
  gekkoname: NetworkStatusValue;
  language: NetworkStatusValue;
  version: NetworkStatusValue;
  hardware: NetworkStatusValue;
};

export enum NetworkLanguage {
  DE = '0',
  IT = '1',
  EN = '2',
  NL = '3',
  ES = '4',
  FR = '5',
  CS = '6',
}

export class NetworkAPI {
  constructor(readonly api: QueryAPI) {}

  protected async getStatus(): Promise<NetworkStatus> {
    const status = await this.api.getStatus();

    if (status.globals.network === undefined) {
      throw new Error('Invalid status.');
    }

    return status.globals.network;
  }

  async getHostname(): Promise<string> {
    const status = await this.getStatus();

    return status.gekkoname.value;
  }

  async getLanguage(): Promise<NetworkLanguage> {
    const status = await this.getStatus();

    return status.language.value as NetworkLanguage;
  }

  async getSoftwareVersion(): Promise<string> {
    const status = await this.getStatus();

    return status.version.value;
  }

  async getHardwareVersion(): Promise<string> {
    const status = await this.getStatus();

    return status.hardware.value;
  }
}
