import { AxiosCacheInstance } from 'axios-cache-interceptor';
import { MockProxy, mock } from 'jest-mock-extended';

import { BlindAPI } from './blind.api';
import { QueryAPIClient } from './client';
import { MeteoAPI } from './meteo.api';
import { NetworkAPI } from './network.api';
import { QueryAPI, Resources, Status } from './query.api';

describe('Query API', () => {
  let instance: MockProxy<AxiosCacheInstance>;
  let client: MockProxy<QueryAPIClient>;
  beforeEach(() => {
    instance = mock<AxiosCacheInstance>();
    client = mock<QueryAPIClient>({ instance });
  });
  it('should provide client', () => {
    const api = new QueryAPI(client);

    expect(api.client).toBe(client);
  });
  it('should get resources', async () => {
    const resources = mock<Resources>();

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getResources()).resolves.toBe(resources);
  });
  it('should throw an error for invalid resources', async () => {
    instance.get.mockResolvedValue({ data: undefined });

    const api = new QueryAPI(client);

    await expect(api.getResources()).rejects.toThrow(
      'Invalid resources response.',
    );
  });
  it('should get blinds', async () => {
    const resources = mock<Resources>({
      blinds: {
        item0: {
          name: '__blind__',
          page: '__page__',
          sumstate: {
            value: '__sumstate__',
            type: 'STRING',
            permission: 'READ',
            index: 0,
          },
          scmd: {
            value: '__scmd__',
            type: 'STRING',
            permission: 'WRITE',
            index: 0,
          },
        },
      },
    });

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getBlinds()).resolves.toEqual([
      new BlindAPI(api, 'item0'),
    ]);
  });
  it('should throw an error for invalid blinds', async () => {
    const resources = mock<Resources>({ blinds: undefined });

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getBlinds()).rejects.toThrow('No blinds found.');
  });
  it('should get specific blind', async () => {
    const resources = mock<Resources>({
      blinds: {
        item0: {
          name: '__blind__',
          page: '__page__',
          sumstate: {
            value: '__sumstate__',
            type: 'STRING',
            permission: 'READ',
            index: 0,
          },
          scmd: {
            value: '__scmd__',
            type: 'STRING',
            permission: 'WRITE',
            index: 0,
          },
        },
      },
    });

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getBlind('item0')).resolves.toEqual(
      new BlindAPI(api, 'item0'),
    );
  });
  it('should throw an error for invalid blind', async () => {
    const resources = mock<Resources>({ blinds: undefined });

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getBlind('item0')).rejects.toThrow('Blind not found.');
  });
  it('should get meteo', async () => {
    const resources = mock<Resources>({
      globals: {
        meteo: {
          twilight: {
            description: '__description_',
            format: '__format__',
            type: 'AI',
            permission: 'READ',
            index: 0,
          },
          brightness: {
            description: '__description_',
            format: '__format__',
            type: 'AI',
            permission: 'READ',
            index: 0,
          },
          brightnessw: {
            description: '__description_',
            format: '__format__',
            type: 'AI',
            permission: 'READ',
            index: 0,
          },
          brightnesso: {
            description: '__description_',
            format: '__format__',
            type: 'AI',
            permission: 'READ',
            index: 0,
          },
          wind: {
            description: '__description_',
            format: '__format__',
            type: 'AI',
            permission: 'READ',
            index: 0,
          },
          temperature: {
            description: '__description_',
            format: '__format__',
            type: 'AI',
            permission: 'READ',
            index: 0,
          },
          rain: {
            description: '__description_',
            format: '__format__',
            type: 'AI',
            permission: 'READ',
            index: 0,
          },
        },
      },
    });

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getMeteo()).resolves.toEqual(new MeteoAPI(api));
  });
  it('should throw an error for invalid meteo', async () => {
    const resources = mock<Resources>({ globals: { meteo: undefined } });

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getMeteo()).rejects.toThrow('Meteo not found.');
  });
  it('should get network', async () => {
    const resources = mock<Resources>({ globals: { network: {} } });

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getNetwork()).resolves.toEqual(new NetworkAPI(api));
  });
  it('should throw an error for invalid network', async () => {
    const resources = mock<Resources>({ globals: { network: undefined } });

    instance.get.mockResolvedValue({ data: resources });

    const api = new QueryAPI(client);

    await expect(api.getNetwork()).rejects.toThrow('Network not found.');
  });
  it('should get status', async () => {
    const status = mock<Status>();

    instance.get.mockResolvedValue({ data: status });

    const api = new QueryAPI(client);

    await expect(api.getStatus()).resolves.toBe(status);
  });
  it('should throw an error for invalid status', async () => {
    instance.get.mockResolvedValue({ data: undefined });

    const api = new QueryAPI(client);

    await expect(api.getStatus()).rejects.toThrow('Invalid status response.');
  });
  it('should set blind status', async () => {
    const api = new QueryAPI(client);

    await api.setBlindStatus('item0', 'T');

    expect(instance.get).toHaveBeenCalledWith('/var/blinds/item0/scmd/set', {
      cache: false,
      params: { value: 'T' },
    });
  });
});
