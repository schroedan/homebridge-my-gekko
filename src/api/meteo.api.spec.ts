import { mock, MockProxy } from 'jest-mock-extended';

import { MeteoAPI } from './meteo.api';
import { QueryAPI, Resources, Status } from './query.api';

describe('Meteo API', () => {
  const resources: Resources = {
    globals: {
      meteo: {
        twilight: {
          description: '__description_',
          format: 'float[0.00,100000.00](lx)',
          type: 'AI',
          permission: 'READ',
          index: 0,
        },
        brightness: {
          description: '__description_',
          format: 'float[0.00,100000.00](kLx)',
          type: 'AI',
          permission: 'READ',
          index: 0,
        },
        brightnessw: {
          description: '__description_',
          format: 'float[0.00,100000.00](kLx)',
          type: 'AI',
          permission: 'READ',
          index: 0,
        },
        brightnesso: {
          description: '__description_',
          format: 'float[0.00,100000.00](kLx)',
          type: 'AI',
          permission: 'READ',
          index: 0,
        },
        wind: {
          description: '__description_',
          format: 'float[0.00,100000.00](m/s)',
          type: 'AI',
          permission: 'READ',
          index: 0,
        },
        temperature: {
          description: '__description_',
          format: 'float[-100.00,100.00](°C)',
          type: 'AI',
          permission: 'READ',
          index: 0,
        },
        rain: {
          description: '__description_',
          format: 'float[0.00,100.00](l/h)',
          type: 'AI',
          permission: 'READ',
          index: 0,
        },
      },
    },
  };
  const status: Status = {
    globals: {
      meteo: {
        twilight: {
          value: '0',
        },
        brightness: {
          value: '0',
        },
        brightnessw: {
          value: '0',
        },
        brightnesso: {
          value: '0',
        },
        wind: {
          value: '0',
        },
        temperature: {
          value: '0',
        },
        rain: {
          value: '0',
        },
      },
    },
  };
  let api: MockProxy<QueryAPI>;
  beforeEach(() => {
    api = mock<QueryAPI>();
  });
  it('should provide API', () => {
    const meteo = new MeteoAPI(api);

    expect(meteo.api).toBe(api);
  });
  it('should throw an error for invalid resource', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue({ globals: {} });
    api.getStatus.mockResolvedValue({ globals: {} });

    await expect(meteo.getTwilight()).rejects.toThrow('Invalid resource.');
  });
  it('should throw an error for invalid status', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue({ globals: {} });

    await expect(meteo.getTwilight()).rejects.toThrow('Invalid status.');
  });
  it('should get twilight with unknown unit', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue({
      globals: {
        meteo: {
          ...resources.globals.meteo!,
          twilight: {
            description: '__description_',
            format: '__format__',
            type: 'AI',
            permission: 'READ',
            index: 0,
          },
        },
      },
    });
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getTwilight()).resolves.toEqual({
      value: 0,
      unit: 'n/a',
    });
  });
  it('should get twilight', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getTwilight()).resolves.toEqual({
      value: 0,
      unit: 'lx',
    });
  });
  it('should get brightness', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getBrightness()).resolves.toEqual({
      value: 0,
      unit: 'kLx',
    });
  });
  it('should get brightness east', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getBrightnessEast()).resolves.toEqual({
      value: 0,
      unit: 'kLx',
    });
  });
  it('should get brightness west', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getBrightnessWest()).resolves.toEqual({
      value: 0,
      unit: 'kLx',
    });
  });
  it('should get wind', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getWind()).resolves.toEqual({
      value: 0,
      unit: 'm/s',
    });
  });
  it('should get temperature', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getTemperature()).resolves.toEqual({
      value: 0,
      unit: '°C',
    });
  });
  it('should get rain', async () => {
    const meteo = new MeteoAPI(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getRain()).resolves.toEqual({
      value: 0,
      unit: 'l/h',
    });
  });
});
