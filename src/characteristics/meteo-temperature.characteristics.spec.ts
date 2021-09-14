import { Characteristic as ServcieCharacteristic, Service } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { Meteo as MeteoAPI } from '../api';
import { Container } from '../container';
import { Platform } from '../platform';
import { MeteoTemperatureCharacteristics } from './meteo-temperature.characteristics';

describe('Meteo Temperature Characteristics', () => {
  let platform: MockProxy<Platform>;
  let container: MockProxy<Container>;
  let service: MockProxy<Service>;
  let api: MockProxy<MeteoAPI>;
  beforeEach(() => {
    platform = mock<Platform>({
      config: {
        delay: undefined,
      },
      api: {
        hap: {
          Characteristic: mock<typeof ServcieCharacteristic>(),
        },
      },
    });
    container = mock<Container>({ platform });
    service = mock<Service>();
    api = mock<MeteoAPI>();
  });
  it('should provide container, service and API', () => {
    const meteoTemperature = new MeteoTemperatureCharacteristics(
      container,
      service,
      api,
    );

    expect(meteoTemperature.container).toBe(container);
    expect(meteoTemperature.service).toBe(service);
    expect(meteoTemperature.api).toBe(api);
  });
  it('should provide current temperature characteristic', () => {
    const currentTemperature = mock<ServcieCharacteristic>();
    const meteoTemperature = new MeteoTemperatureCharacteristics(
      container,
      service,
      api,
    );

    service.getCharacteristic.mockReturnValue(currentTemperature);

    expect(meteoTemperature.currentTemperature).toBe(currentTemperature);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.CurrentTemperature,
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

    const meteoTemperature = new MeteoTemperatureCharacteristics(
      container,
      service,
      api,
    );

    meteoTemperature.registerListeners();

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
    const meteoTemperature = new MeteoTemperatureCharacteristics(
      container,
      service,
      api,
    );

    api.getTemperature.mockResolvedValue({ value: 20.5, unit: '°C' });

    meteoTemperature.registerListeners();

    expect(getTemperature).toHaveBeenCalled();
  });
  it('should update current temperature', () => {
    const meteoTemperature = new MeteoTemperatureCharacteristics(
      container,
      service,
      api,
    );

    meteoTemperature.updateCurrentTemperature('__temperature__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.CurrentTemperature,
      '__temperature__',
    );
  });
  it('should get temperature', async () => {
    const meteoTemperature = new MeteoTemperatureCharacteristics(
      container,
      service,
      api,
    );

    api.getTemperature.mockResolvedValue({ value: 20.5, unit: '°C' });

    await expect(meteoTemperature.getTemperature()).resolves.toBe(20.5);
    await expect(meteoTemperature.getUnit()).resolves.toBe('°C');
  });
});
