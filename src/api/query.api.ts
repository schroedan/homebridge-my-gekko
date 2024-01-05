import { BlindAPI, BlindResource, BlindStatus } from './blind.api';
import { QueryAPIClient } from './client';
import { MeteoAPI, MeteoResource, MeteoStatus } from './meteo.api';
import { NetworkAPI, NetworkResource, NetworkStatus } from './network.api';

export type Resources = {
  globals: {
    meteo?: MeteoResource;
    network?: NetworkResource;
  };
  blinds?: Record<string, BlindResource>;
};

export type Status = {
  globals: {
    meteo?: MeteoStatus;
    network?: NetworkStatus;
  };
  blinds?: Record<string, BlindStatus>;
};

export class QueryAPI {
  constructor(public readonly client: QueryAPIClient) {}

  async getResources(): Promise<Resources> {
    const response = await this.client.instance.get('/var');

    if (response.data === undefined) {
      throw new Error('Invalid resources response.');
    }

    return response.data;
  }

  async getBlinds(): Promise<BlindAPI[]> {
    const resources = await this.getResources();

    if (resources.blinds === undefined) {
      throw new Error('No blinds found.');
    }

    return Object.keys(resources.blinds)
      .filter((key) => key.substring(0, 4) === 'item')
      .map((key) => new BlindAPI(this, key));
  }

  async getBlind(key: string): Promise<BlindAPI> {
    const resources = await this.getResources();

    if (resources.blinds === undefined || resources.blinds[key] === undefined) {
      throw new Error('Blind not found.');
    }

    return new BlindAPI(this, key);
  }

  async getMeteo(): Promise<MeteoAPI> {
    const resources = await this.getResources();

    if (resources.globals.meteo === undefined) {
      throw new Error('Meteo not found.');
    }

    return new MeteoAPI(this);
  }

  async getNetwork(): Promise<NetworkAPI> {
    const resources = await this.getResources();

    if (resources.globals.network === undefined) {
      throw new Error('Network not found.');
    }

    return new NetworkAPI(this);
  }

  async getStatus(): Promise<Status> {
    const response = await this.client.instance.get('/var/status');

    if (response.data === undefined) {
      throw new Error('Invalid status response.');
    }

    return response.data;
  }

  async setBlindStatus(key: string, value: string): Promise<void> {
    await this.client.instance.get(`/var/blinds/${key}/scmd/set`, {
      cache: false,
      params: { value },
    });
  }
}
