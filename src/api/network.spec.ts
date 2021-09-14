import { mock, MockProxy } from 'jest-mock-extended';
import { API, Status } from './api';
import { Network, NetworkLanguage } from './network';

describe('Network', () => {
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
  let api: MockProxy<API>;
  beforeEach(() => {
    api = mock<API>();
  });
  it('should provide API', () => {
    const network = new Network(api);

    expect(network.api).toBe(api);
  });
  it('should throw an error for invalid status', async () => {
    const network = new Network(api);

    api.getStatus.mockResolvedValue({ globals: {} });

    await expect(network.getHostname()).rejects.toThrow('Invalid status.');
  });
  it('should get hostname', async () => {
    const network = new Network(api);

    api.getStatus.mockResolvedValue(status);

    await expect(network.getHostname()).resolves.toEqual('mygekko');
  });
  it('should get humidity', async () => {
    const network = new Network(api);

    api.getStatus.mockResolvedValue(status);

    await expect(network.getLanguage()).resolves.toEqual(NetworkLanguage.EN);
  });
  it('should get brightness', async () => {
    const network = new Network(api);

    api.getStatus.mockResolvedValue(status);

    await expect(network.getSoftwareVersion()).resolves.toEqual('123');
  });
  it('should get wind', async () => {
    const network = new Network(api);

    api.getStatus.mockResolvedValue(status);

    await expect(network.getHardwareVersion()).resolves.toEqual('456');
  });
});
