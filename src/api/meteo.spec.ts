import { mock, MockProxy } from 'jest-mock-extended';
import { API, Resources, Status } from './api';
import { Meteo } from './meteo';

describe('Meteo', () => {
  const resources: Resources = {
    globals: {
      meteo: {
        twilight: {
          value: 'Act.Value',
          type: 'REAL',
          unit: '__unit__',
          permission: 'READ',
          index: 0,
        },
        humidity: {
          value: 'Act.Value',
          type: 'REAL',
          unit: '__unit__',
          permission: 'READ',
          index: 0,
        },
        brightness: {
          value: 'Act.Value',
          type: 'REAL',
          unit: '__unit__',
          permission: 'READ',
          index: 0,
        },
        brightnessw: {
          value: 'Act.Value',
          type: 'REAL',
          unit: '__unit__',
          permission: 'READ',
          index: 0,
        },
        brightnesso: {
          value: 'Act.Value',
          type: 'REAL',
          unit: '__unit__',
          permission: 'READ',
          index: 0,
        },
        wind: {
          value: 'Act.Value',
          type: 'REAL',
          unit: '__unit__',
          permission: 'READ',
          index: 0,
        },
        temperature: {
          value: 'Act.Value',
          type: 'REAL',
          unit: '__unit__',
          permission: 'READ',
          index: 0,
        },
        rain: {
          value: 'Act.Value',
          type: 'REAL',
          unit: '__unit__',
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
        humidity: {
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
  let api: MockProxy<API>;
  beforeEach(() => {
    api = mock<API>();
  });
  it('should provide API', () => {
    const meteo = new Meteo(api);

    expect(meteo.api).toBe(api);
  });
  it('should throw an error for invalid resource', async () => {
    const meteo = new Meteo(api);

    api.getResources.mockResolvedValue({ globals: {} });
    api.getStatus.mockResolvedValue({ globals: {} });

    await expect(meteo.getTwilight()).rejects.toThrow('Invalid resource.');
  });
  it('should throw an error for invalid status', async () => {
    const meteo = new Meteo(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue({ globals: {} });

    await expect(meteo.getTwilight()).rejects.toThrow('Invalid status.');
  });
  it('should get twilight', async () => {
    const meteo = new Meteo(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getTwilight()).resolves.toEqual({
      value: 0,
      unit: '__unit__',
    });
  });
  it('should get humidity', async () => {
    const meteo = new Meteo(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getHumidity()).resolves.toEqual({
      value: 0,
      unit: '__unit__',
    });
  });
  it('should get brightness', async () => {
    const meteo = new Meteo(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getBrightness()).resolves.toEqual({
      value: 0,
      unit: '__unit__',
    });
  });
  it('should get wind', async () => {
    const meteo = new Meteo(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getWind()).resolves.toEqual({
      value: 0,
      unit: '__unit__',
    });
  });
  it('should get temperature', async () => {
    const meteo = new Meteo(api);

    api.getResources.mockResolvedValue(resources);
    api.getStatus.mockResolvedValue(status);

    await expect(meteo.getTemperature()).resolves.toEqual({
      value: 0,
      unit: '__unit__',
    });
  });
});
