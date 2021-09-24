import { BlindAPI, BlindResource, BlindStatus } from './blind.api';
import { Client } from './client';
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
  constructor(readonly client: Client) {}

  async getResources(): Promise<Resources> {
    const request = this.client.readRequest().withPath('/var');
    const response = await this.client.query(request);
    const resources = response.json<Resources>();

    if (resources === undefined) {
      throw new Error('Invalid resources response.');
    }

    return resources;
  }

  async getStatus(): Promise<Status> {
    const request = this.client.readRequest().withPath('/var/status');
    const response = await this.client.query(request);
    const status = response.json<Status>();

    if (status === undefined) {
      throw new Error('Invalid status response.');
    }

    return status;
  }

  async getBlinds(): Promise<BlindAPI[]> {
    const resources = await this.getResources();

    if (resources.blinds === undefined) {
      throw new Error('No blinds found.');
    }

    return Object.keys(resources.blinds)
      .filter((key) => key.substr(0, 4) === 'item')
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
}
