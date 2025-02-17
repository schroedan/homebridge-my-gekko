import { MockProxy, mock } from 'jest-mock-extended';

import { NetworkAPI, NetworkLanguage } from './network.api';
import { QueryAPI, Status } from './query.api';

describe('Network API', () => {
  const status: Status = {
    globals: {
      network: {
        gekkoname: {
          value: 'mygekko',
        },
        language: {
          value: NetworkLanguage.EN,
        },
        version: {
          value: '123',
        },
        hardware: {
          value: '456',
        },
      },
    },
  };
  let api: MockProxy<QueryAPI>;
  beforeEach(() => {
    api = mock<QueryAPI>();
  });
  it('should provide API', () => {
    const network = new NetworkAPI(api);

    expect(network.api).toBe(api);
  });
  it('should throw an error for invalid status', async () => {
    const network = new NetworkAPI(api);

    api.getStatus.mockResolvedValue({ globals: {} });

    await expect(network.getHostname()).rejects.toThrow('Invalid status.');
  });
  it('should get hostname', async () => {
    const network = new NetworkAPI(api);

    api.getStatus.mockResolvedValue(status);

    await expect(network.getHostname()).resolves.toEqual('mygekko');
  });
  it('should get language', async () => {
    const network = new NetworkAPI(api);

    api.getStatus.mockResolvedValue(status);

    await expect(network.getLanguage()).resolves.toEqual(NetworkLanguage.EN);
  });
  it('should get software version', async () => {
    const network = new NetworkAPI(api);

    api.getStatus.mockResolvedValue(status);

    await expect(network.getSoftwareVersion()).resolves.toEqual('123');
  });
  it('should get hardware version', async () => {
    const network = new NetworkAPI(api);

    api.getStatus.mockResolvedValue(status);

    await expect(network.getHardwareVersion()).resolves.toEqual('456');
  });
});
