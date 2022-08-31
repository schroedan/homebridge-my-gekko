import { Logging } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { MeteoBrightnessCharacteristics } from '../characteristics';
import { PlatformEventEmitter } from '../platform-events';
import { MeteoBrightnessObserver } from './meteo-brightness.observer';

describe('Meteo Brightness Observer', () => {
  let characteristics: MockProxy<MeteoBrightnessCharacteristics>;
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  beforeEach(() => {
    characteristics = mock<MeteoBrightnessCharacteristics>();
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
    const observer = new MeteoBrightnessObserver(
      characteristics,
      eventEmitter,
      logger,
    );

    expect(observer.characteristics).toBe(characteristics);
    expect(observer.eventEmitter).toBe(eventEmitter);
    expect(observer.logger).toBe(logger);
  });
  it('should update current ambient light level on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(eventEmitter, 'onHeartbeat');
    const updateCurrentAmbientLightLevel = jest.spyOn(
      MeteoBrightnessObserver.prototype,
      'updateCurrentAmbientLightLevel',
    );

    const observer = new MeteoBrightnessObserver(
      characteristics,
      eventEmitter,
      logger,
    );

    observer.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateCurrentAmbientLightLevel).toHaveBeenCalled();
  });
  it('should update current ambient light level in characteristics', async () => {
    characteristics.getCurrentAmbientLightLevel.mockResolvedValue(1000.5);
    characteristics.getUnit.mockResolvedValue('Lux');

    const observer = new MeteoBrightnessObserver(
      characteristics,
      eventEmitter,
      logger,
    );

    await observer.updateCurrentAmbientLightLevel();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating current ambient light level of meteo: 1000.5 Lux',
    );
    expect(characteristics.updateCurrentAmbientLightLevel).toHaveBeenCalledWith(
      1000.5,
    );
  });
  it('should log error on failed update', async () => {
    jest
      .spyOn(
        MeteoBrightnessObserver.prototype,
        'updateCurrentAmbientLightLevel',
      )
      .mockRejectedValue('__reason__');

    const observer = new MeteoBrightnessObserver(
      characteristics,
      eventEmitter,
      logger,
    );

    observer.registerListeners();

    await new Promise(setImmediate);

    expect(logger.error).toHaveBeenCalledWith('__reason__');
  });
});