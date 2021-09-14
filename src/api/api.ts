import { Blind, BlindResource, BlindStatus } from './blind';
import { Client } from './client';
import { Meteo, MeteoResource, MeteoStatus } from './meteo';
import { Network, NetworkResource, NetworkStatus } from './network';

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

export class API {
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

  async getBlinds(): Promise<Blind[]> {
    const resources = await this.getResources();

    if (resources.blinds === undefined) {
      throw new Error('No blinds found.');
    }

    return Object.keys(resources.blinds)
      .filter((key) => key.substr(0, 4) === 'item')
      .map((key) => new Blind(this, key));
  }

  async getBlind(key: string): Promise<Blind> {
    const resources = await this.getResources();

    if (resources.blinds === undefined || resources.blinds[key] === undefined) {
      throw new Error('Blind not found.');
    }

    return new Blind(this, key);
  }

  async getMeteo(): Promise<Meteo> {
    const resources = await this.getResources();

    if (resources.globals.meteo === undefined) {
      throw new Error('Meteo not found.');
    }

    return new Meteo(this);
  }

  async getNetwork(): Promise<Network> {
    const resources = await this.getResources();

    if (resources.globals.network === undefined) {
      throw new Error('Network not found.');
    }

    return new Network(this);
  }
}
