import {
  API,
  Characteristic as ServcieCharacteristic,
  Logging,
  PlatformConfig,
  Service,
} from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { BlindAPI, BlindState, BlindSumState } from '../api';
import { Delay } from '../delay';
import { PlatformEventEmitter } from '../platform-events';
import { BlindCharacteristics } from './blind.characteristics';

describe('Blind Characteristics', () => {
  let api: MockProxy<API>;
  let service: MockProxy<Service>;
  let blind: MockProxy<BlindAPI>;
  let config: MockProxy<PlatformConfig>;
  let logger: MockProxy<Logging>;
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  beforeEach(() => {
    api = mock<API>({
      hap: {
        Characteristic: mock<typeof ServcieCharacteristic>(),
      },
    });
    service = mock<Service>();
    blind = mock<BlindAPI>();
    config = mock<PlatformConfig>();
    logger = mock<Logging>();
    eventEmitter = mock<PlatformEventEmitter>();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should provide api, service, blind, config, logger and event emitter', () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    expect(characteristics.api).toBe(api);
    expect(characteristics.service).toBe(service);
    expect(characteristics.blind).toBe(blind);
    expect(characteristics.config).toBe(config);
    expect(characteristics.logger).toBe(logger);
    expect(characteristics.eventEmitter).toBe(eventEmitter);
  });
  it('should provide name characteristic', () => {
    const name = mock<ServcieCharacteristic>();
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    service.getCharacteristic.mockReturnValue(name);

    expect(characteristics.name).toBe(name);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.Name,
    );
  });
  it('should provide current position characteristic', () => {
    const currentPosition = mock<ServcieCharacteristic>();
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    service.getCharacteristic.mockReturnValue(currentPosition);

    expect(characteristics.currentPosition).toBe(currentPosition);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.CurrentPosition,
    );
  });
  it('should provide target position characteristic', () => {
    const targetPosition = mock<ServcieCharacteristic>();
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    service.getCharacteristic.mockReturnValue(targetPosition);

    expect(characteristics.targetPosition).toBe(targetPosition);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.TargetPosition,
    );
  });
  it('should provide position state characteristic', () => {
    const positionState = mock<ServcieCharacteristic>();
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    service.getCharacteristic.mockReturnValue(positionState);

    expect(characteristics.positionState).toBe(positionState);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.PositionState,
    );
  });
  it('should provide obstruction detected characteristic', () => {
    const obstructionDetected = mock<ServcieCharacteristic>();
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    service.getCharacteristic.mockReturnValue(obstructionDetected);

    expect(characteristics.obstructionDetected).toBe(obstructionDetected);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.ObstructionDetected,
    );
  });
  it('should provide usher', () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    expect(characteristics.usher).toBeInstanceOf(Delay);
  });
  it('should provide custom usher', () => {
    config.delay = 100;

    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );
    const usher = characteristics.usher;

    expect(characteristics.usher).toBe(usher);
  });
  it('should register listeners', () => {
    const name = mock<ServcieCharacteristic>();
    const currentPosition = mock<ServcieCharacteristic>();
    const targetPosition = mock<ServcieCharacteristic>();
    const positionState = mock<ServcieCharacteristic>();
    const obstructionDetected = mock<ServcieCharacteristic>();
    const usher = mock<Delay<() => void>>();

    usher.set.mockImplementation((callback) => {
      callback();
      return usher;
    });

    positionState.onGet.mockImplementation((handler) => {
      handler(undefined);
      return positionState;
    });

    obstructionDetected.onGet.mockImplementation((handler) => {
      handler(undefined);
      return obstructionDetected;
    });

    eventEmitter.onShutdown.mockImplementation((listener) => {
      listener();
    });

    jest
      .spyOn(BlindCharacteristics.prototype, 'name', 'get')
      .mockReturnValue(name);
    jest
      .spyOn(BlindCharacteristics.prototype, 'currentPosition', 'get')
      .mockReturnValue(currentPosition);
    jest
      .spyOn(BlindCharacteristics.prototype, 'targetPosition', 'get')
      .mockReturnValue(targetPosition);
    jest
      .spyOn(BlindCharacteristics.prototype, 'positionState', 'get')
      .mockReturnValue(positionState);
    jest
      .spyOn(BlindCharacteristics.prototype, 'obstructionDetected', 'get')
      .mockReturnValue(obstructionDetected);
    jest
      .spyOn(BlindCharacteristics.prototype, 'usher', 'get')
      .mockReturnValue(usher);

    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.registerListeners();

    expect(name.onGet).toHaveBeenCalled();
    expect(currentPosition.onGet).toHaveBeenCalled();
    expect(targetPosition.onSet).toHaveBeenCalled();
    expect(positionState.onGet).toHaveBeenCalled();
    expect(obstructionDetected.onGet).toHaveBeenCalled();
    expect(eventEmitter.onShutdown).toHaveBeenCalled();
  });
  it('should return name on get name', () => {
    const name = mock<ServcieCharacteristic>();

    name.onGet.mockImplementation((handler) => {
      handler(undefined);
      return name;
    });

    jest
      .spyOn(BlindCharacteristics.prototype, 'name', 'get')
      .mockReturnValue(name);

    const getName = jest.spyOn(BlindCharacteristics.prototype, 'getName');
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.registerListeners();

    expect(getName).toHaveBeenCalled();
  });
  it('should return position on get current position', () => {
    const currentPosition = mock<ServcieCharacteristic>();

    currentPosition.onGet.mockImplementation((handler) => {
      handler(undefined);
      return currentPosition;
    });

    jest
      .spyOn(BlindCharacteristics.prototype, 'currentPosition', 'get')
      .mockReturnValue(currentPosition);

    const getPosition = jest.spyOn(
      BlindCharacteristics.prototype,
      'getPosition',
    );
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.registerListeners();

    expect(getPosition).toHaveBeenCalled();
  });
  it('should apply position after a short delay on set target position', () => {
    config.delay = 100;

    const targetPosition = mock<ServcieCharacteristic>();

    targetPosition.onSet.mockImplementation((handler) => {
      handler(50, undefined);
      return targetPosition;
    });

    jest
      .spyOn(BlindCharacteristics.prototype, 'targetPosition', 'get')
      .mockReturnValue(targetPosition);

    const setPosition = jest.spyOn(
      BlindCharacteristics.prototype,
      'setPosition',
    );
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.registerListeners();

    jest.advanceTimersByTime(100);

    expect(setPosition).toHaveBeenCalledWith(50);
  });

  it('should update name', () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.updateName('__name__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.Name,
      '__name__',
    );
  });
  it('should update current position', () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.updateCurrentPosition('__position__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.CurrentPosition,
      '__position__',
    );
  });
  it('should update target position', () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.updateTargetPosition('__position__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.TargetPosition,
      '__position__',
    );
  });
  it('should update position state', () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.updatePositionState('__state__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.PositionState,
      '__state__',
    );
  });
  it('should update obstruction detected', () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.updateObstructionDetected('__obstruction__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      api.hap.Characteristic.ObstructionDetected,
      '__obstruction__',
    );
  });
  it('should get name', async () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    blind.getName.mockResolvedValue('__name__');

    await expect(characteristics.getName()).resolves.toBe('__name__');
  });
  it('should get position', async () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    blind.getPosition.mockResolvedValue(20.4);

    await expect(characteristics.getPosition()).resolves.toBe(80);
  });
  it('should set position', async () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    await characteristics.setPosition(20.4);

    expect(blind.setPosition).toHaveBeenCalledWith(79.6);
  });
  it('should get position state decreasing', async () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    blind.getState.mockResolvedValue(BlindState.DOWN);

    await expect(characteristics.getPositionState()).resolves.toBe(
      api.hap.Characteristic.PositionState.DECREASING,
    );
    await expect(characteristics.isDecreasing()).resolves.toBeTruthy();

    blind.getState.mockResolvedValue(BlindState.HOLD_DOWN);

    await expect(characteristics.getPositionState()).resolves.toBe(
      api.hap.Characteristic.PositionState.DECREASING,
    );
    await expect(characteristics.isDecreasing()).resolves.toBeTruthy();
  });
  it('should get position state increasing', async () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    blind.getState.mockResolvedValue(BlindState.UP);

    await expect(characteristics.getPositionState()).resolves.toBe(
      api.hap.Characteristic.PositionState.INCREASING,
    );
    await expect(characteristics.isIncreasing()).resolves.toBeTruthy();

    blind.getState.mockResolvedValue(BlindState.HOLD_UP);

    await expect(characteristics.getPositionState()).resolves.toBe(
      api.hap.Characteristic.PositionState.INCREASING,
    );
    await expect(characteristics.isIncreasing()).resolves.toBeTruthy();
  });
  it('should get position state stopped', async () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    blind.getState.mockResolvedValue(BlindState.STOP);

    await expect(characteristics.getPositionState()).resolves.toBe(
      api.hap.Characteristic.PositionState.STOPPED,
    );
    await expect(characteristics.isStopped()).resolves.toBeTruthy();
  });
  it('should get obstruction detected', async () => {
    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    blind.getSumState.mockResolvedValue(BlindSumState.LOCKED);

    await expect(characteristics.isObstructionDetected()).resolves.toBeTruthy();
  });
  it('should log error on set target position', async () => {
    const targetPosition = mock<ServcieCharacteristic>();

    targetPosition.onSet.mockImplementation((handler) => {
      handler(50, undefined);
      return targetPosition;
    });

    jest
      .spyOn(BlindCharacteristics.prototype, 'targetPosition', 'get')
      .mockReturnValue(targetPosition);
    jest
      .spyOn(BlindCharacteristics.prototype, 'setPosition')
      .mockRejectedValue('__reason__');

    const characteristics = new BlindCharacteristics(
      api,
      service,
      blind,
      config,
      logger,
      eventEmitter,
    );

    characteristics.registerListeners();

    jest.advanceTimersByTime(500);

    await new Promise(setImmediate);

    expect(logger.error).toHaveBeenCalledWith('__reason__');
  });
});
