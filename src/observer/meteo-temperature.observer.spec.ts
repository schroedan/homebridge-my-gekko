import { Logging } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { MeteoTemperatureCharacteristics } from '../characteristics';
import { Container } from '../container';
import { Platform } from '../platform';
import { MeteoTemperatureObserver } from './meteo-temperature.observer';

describe('Meteo Temperature Observer', () => {
  let platform: MockProxy<Platform>;
  let container: MockProxy<Container>;
  let characteristics: MockProxy<MeteoTemperatureCharacteristics>;
  beforeEach(() => {
    platform = mock<Platform>({
      log: mock<Logging>(),
      onHeartbeat: (listener) => {
        listener();
      },
    });
    container = mock<Container>({ platform });
    characteristics = mock<MeteoTemperatureCharacteristics>();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should provide container and characteristics', () => {
    const meteoTemperature = new MeteoTemperatureObserver(
      container,
      characteristics,
    );

    expect(meteoTemperature.container).toBe(container);
    expect(meteoTemperature.characteristics).toBe(characteristics);
  });
  it('should update current temperature on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(platform, 'onHeartbeat');
    const updateCurrentTemperature = jest.spyOn(
      MeteoTemperatureObserver.prototype,
      'updateCurrentTemperature',
    );

    const meteoTemperature = new MeteoTemperatureObserver(
      container,
      characteristics,
    );

    meteoTemperature.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateCurrentTemperature).toHaveBeenCalled();
  });
  it('should update current temperature in characteristics', async () => {
    characteristics.getTemperature.mockResolvedValue(20.5);
    characteristics.getUnit.mockResolvedValue('°C');

    const meteoTemperature = new MeteoTemperatureObserver(
      container,
      characteristics,
    );

    await meteoTemperature.updateCurrentTemperature();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating current temperature of meteo: 20.5 °C',
    );
    expect(characteristics.updateCurrentTemperature).toHaveBeenCalledWith(20.5);
  });
  it('should log error on failed update', async () => {
    jest
      .spyOn(MeteoTemperatureObserver.prototype, 'updateCurrentTemperature')
      .mockRejectedValue('__reason__');

    const meteoTemperature = new MeteoTemperatureObserver(
      container,
      characteristics,
    );

    meteoTemperature.registerListeners();

    await Promise.resolve();

    expect(platform.log.error).toHaveBeenCalledWith('__reason__');
  });
});
