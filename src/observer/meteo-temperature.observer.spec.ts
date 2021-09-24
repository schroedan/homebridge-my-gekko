import { Logging } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { MeteoTemperatureCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';
import { MeteoTemperatureObserver } from './meteo-temperature.observer';

describe('Meteo Temperature Observer', () => {
  let characteristics: MockProxy<MeteoTemperatureCharacteristics>;
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  beforeEach(() => {
    characteristics = mock<MeteoTemperatureCharacteristics>();
    eventEmitter = mock<PlatformEventEmitter>({
      onHeartbeat: (listener) => {
        listener();
      },
    });
    logger = mock<Logging>();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should provide characteristics, event emitter and logger', () => {
    const observer = new MeteoTemperatureObserver(
      characteristics,
      eventEmitter,
      logger,
    );

    expect(observer.characteristics).toBe(characteristics);
    expect(observer.eventEmitter).toBe(eventEmitter);
    expect(observer.logger).toBe(logger);
  });
  it('should update current temperature on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(eventEmitter, 'onHeartbeat');
    const updateCurrentTemperature = jest.spyOn(
      MeteoTemperatureObserver.prototype,
      'updateCurrentTemperature',
    );

    const observer = new MeteoTemperatureObserver(
      characteristics,
      eventEmitter,
      logger,
    );

    observer.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateCurrentTemperature).toHaveBeenCalled();
  });
  it('should update current temperature in characteristics', async () => {
    characteristics.getTemperature.mockResolvedValue(20.5);
    characteristics.getUnit.mockResolvedValue('°C');

    const observer = new MeteoTemperatureObserver(
      characteristics,
      eventEmitter,
      logger,
    );

    await observer.updateCurrentTemperature();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating current temperature of meteo: 20.5 °C',
    );
    expect(characteristics.updateCurrentTemperature).toHaveBeenCalledWith(20.5);
  });
  it('should log error on failed update', async () => {
    jest
      .spyOn(MeteoTemperatureObserver.prototype, 'updateCurrentTemperature')
      .mockRejectedValue('__reason__');

    const observer = new MeteoTemperatureObserver(
      characteristics,
      eventEmitter,
      logger,
    );

    observer.registerListeners();

    await new Promise(setImmediate);

    expect(logger.error).toHaveBeenCalledWith('__reason__');
  });
});
