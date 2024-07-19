import {
  API,
  Characteristic as ServcieCharacteristic,
  Service,
} from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import { MeteoAPI } from '../api';
import { MeteoTemperatureCharacteristics } from './meteo-temperature.characteristics';

describe('Meteo Temperature Characteristics', () => {
  let api: MockProxy<API>;
  let service: MockProxy<Service>;
  let meteo: MockProxy<MeteoAPI>;
  beforeEach(() => {
    api = mock<API>({
      hap: {
        Characteristic: mock<typeof ServcieCharacteristic>(),
      },
    });
    service = mock<Service>();
    meteo = mock<MeteoAPI>();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should provide api, service and meteo', () => {
    const characteristics = new MeteoTemperatureCharacteristics(
      api,
      service,
      meteo,
    );

    expect(characteristics.api).toBe(api);
    expect(characteristics.service).toBe(service);
    expect(characteristics.meteo).toBe(meteo);
  });
  it('should provide current temperature characteristic', () => {
    const currentTemperature = mock<ServcieCharacteristic>();
    const characteristics = new MeteoTemperatureCharacteristics(
      api,
      service,
      meteo,
    );

    service.getCharacteristic.mockReturnValue(currentTemperature);

    expect(characteristics.currentTemperature).toBe(currentTemperature);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.CurrentTemperature,
    );
  });
  it('should register listeners', () => {
    const currentTemperature = mock<ServcieCharacteristic>();

    jest
      .spyOn(
        MeteoTemperatureCharacteristics.prototype,
        'currentTemperature',
        'get',
      )
      .mockReturnValue(currentTemperature);

    const characteristics = new MeteoTemperatureCharacteristics(
      api,
      service,
      meteo,
    );

    characteristics.registerListeners();

    expect(currentTemperature.onGet).toHaveBeenCalled();
  });
  it('should return temperature on get current temperature', () => {
    const currentTemperature = mock<ServcieCharacteristic>();

    currentTemperature.onGet.mockImplementation((handler) => {
      handler(undefined);
      return currentTemperature;
    });

    jest
      .spyOn(
        MeteoTemperatureCharacteristics.prototype,
        'currentTemperature',
        'get',
      )
      .mockReturnValue(currentTemperature);

    const getTemperature = jest.spyOn(
      MeteoTemperatureCharacteristics.prototype,
      'getTemperature',
    );
    const characteristics = new MeteoTemperatureCharacteristics(
      api,
      service,
      meteo,
    );

    meteo.getTemperature.mockResolvedValue({ value: 20.5, unit: '°C' });

    characteristics.registerListeners();

    expect(getTemperature).toHaveBeenCalled();
  });
  it('should update current temperature', () => {
    const characteristics = new MeteoTemperatureCharacteristics(
      api,
      service,
      meteo,
    );

    characteristics.updateCurrentTemperature('__temperature__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.CurrentTemperature,
      '__temperature__',
    );
  });
  it('should get temperature', async () => {
    const characteristics = new MeteoTemperatureCharacteristics(
      api,
      service,
      meteo,
    );

    meteo.getTemperature.mockResolvedValue({ value: 20.5, unit: '°C' });

    await expect(characteristics.getTemperature()).resolves.toBe(20.5);
    await expect(characteristics.getUnit()).resolves.toBe('°C');
  });
});
