import {
  API,
  Characteristic as ServcieCharacteristic,
  Service,
} from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import { MeteoAPI } from '../api';
import { MeteoBrightnessCharacteristics } from './meteo-brightness.characteristics';

describe('Meteo Brightness Characteristics', () => {
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
  it('should provide api, service and meteo', () => {
    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'south',
    );

    expect(characteristics.api).toBe(api);
    expect(characteristics.service).toBe(service);
    expect(characteristics.meteo).toBe(meteo);
  });
  it('should provide current ambient light level characteristic', () => {
    const currentAmbientLightLevel = mock<ServcieCharacteristic>();
    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'south',
    );

    service.getCharacteristic.mockReturnValue(currentAmbientLightLevel);

    expect(characteristics.currentAmbientLightLevel).toBe(
      currentAmbientLightLevel,
    );
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.CurrentAmbientLightLevel,
    );
  });
  it('should register listeners', () => {
    const currentAmbientLightLevel = mock<ServcieCharacteristic>();

    currentAmbientLightLevel.setProps.mockReturnThis();

    jest
      .spyOn(
        MeteoBrightnessCharacteristics.prototype,
        'currentAmbientLightLevel',
        'get',
      )
      .mockReturnValue(currentAmbientLightLevel);

    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'south',
    );

    characteristics.registerListeners();

    expect(currentAmbientLightLevel.onGet).toHaveBeenCalled();
  });
  it('should return south brightness on get current ambient light level', () => {
    const currentAmbientLightLevel = mock<ServcieCharacteristic>();

    currentAmbientLightLevel.setProps.mockReturnThis();
    currentAmbientLightLevel.onGet.mockImplementation((handler) => {
      handler(undefined);
      return currentAmbientLightLevel;
    });

    jest
      .spyOn(
        MeteoBrightnessCharacteristics.prototype,
        'currentAmbientLightLevel',
        'get',
      )
      .mockReturnValue(currentAmbientLightLevel);

    const getCurrentAmbientLightLevel = jest.spyOn(
      MeteoBrightnessCharacteristics.prototype,
      'getCurrentAmbientLightLevel',
    );
    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'south',
    );

    meteo.getBrightness.mockResolvedValue({ value: 1000.5, unit: 'kLx' });

    characteristics.registerListeners();

    expect(getCurrentAmbientLightLevel).toHaveBeenCalled();
  });
  it('should update current ambient light level', () => {
    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'south',
    );

    characteristics.updateCurrentAmbientLightLevel('__light__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.CurrentAmbientLightLevel,
      '__light__',
    );
  });
  it('should get current ambient light level', async () => {
    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'south',
    );

    meteo.getBrightness.mockResolvedValue({ value: 1000.5, unit: 'Lux' });

    await expect(characteristics.getCurrentAmbientLightLevel()).resolves.toBe(
      1000.5,
    );
    await expect(characteristics.getUnit()).resolves.toBe('Lux');
  });
  it('should get current ambient light level from kLx', async () => {
    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'south',
    );

    meteo.getBrightness.mockResolvedValue({ value: 1.0005, unit: 'kLx' });

    await expect(characteristics.getCurrentAmbientLightLevel()).resolves.toBe(
      1000.5,
    );
    await expect(characteristics.getUnit()).resolves.toBe('Lux');
  });
  it('should get current ambient light level from east', async () => {
    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'east',
    );

    meteo.getBrightnessEast.mockResolvedValue({ value: 1000.5, unit: 'Lux' });

    await expect(characteristics.getCurrentAmbientLightLevel()).resolves.toBe(
      1000.5,
    );
    await expect(characteristics.getUnit()).resolves.toBe('Lux');
  });
  it('should get current ambient light level from west', async () => {
    const characteristics = new MeteoBrightnessCharacteristics(
      api,
      service,
      meteo,
      'west',
    );

    meteo.getBrightnessWest.mockResolvedValue({ value: 1000.5, unit: 'Lux' });

    await expect(characteristics.getCurrentAmbientLightLevel()).resolves.toBe(
      1000.5,
    );
    await expect(characteristics.getUnit()).resolves.toBe('Lux');
  });
});
