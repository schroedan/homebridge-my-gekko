import {
  Characteristic as ServcieCharacteristic,
  Logging,
  Service,
} from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { Blind as BlindAPI, BlindState, BlindSumState } from '../api';
import { Container } from '../container';
import { Delay } from '../delay';
import { Platform } from '../platform';
import { BlindCharacteristics } from './blind.characteristics';

describe('Blind Characteristics', () => {
  let platform: MockProxy<Platform>;
  let container: MockProxy<Container>;
  let service: MockProxy<Service>;
  let api: MockProxy<BlindAPI>;
  beforeEach(() => {
    platform = mock<Platform>({
      log: mock<Logging>(),
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
    api = mock<BlindAPI>();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should provide container, service and API', () => {
    const blind = new BlindCharacteristics(container, service, api);

    expect(blind.container).toBe(container);
    expect(blind.service).toBe(service);
    expect(blind.api).toBe(api);
  });
  it('should provide name characteristic', () => {
    const name = mock<ServcieCharacteristic>();
    const blind = new BlindCharacteristics(container, service, api);

    service.getCharacteristic.mockReturnValue(name);

    expect(blind.name).toBe(name);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.Name,
    );
  });
  it('should provide current position characteristic', () => {
    const currentPosition = mock<ServcieCharacteristic>();
    const blind = new BlindCharacteristics(container, service, api);

    service.getCharacteristic.mockReturnValue(currentPosition);

    expect(blind.currentPosition).toBe(currentPosition);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.CurrentPosition,
    );
  });
  it('should provide target position characteristic', () => {
    const targetPosition = mock<ServcieCharacteristic>();
    const blind = new BlindCharacteristics(container, service, api);

    service.getCharacteristic.mockReturnValue(targetPosition);

    expect(blind.targetPosition).toBe(targetPosition);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.TargetPosition,
    );
  });
  it('should provide position state characteristic', () => {
    const positionState = mock<ServcieCharacteristic>();
    const blind = new BlindCharacteristics(container, service, api);

    service.getCharacteristic.mockReturnValue(positionState);

    expect(blind.positionState).toBe(positionState);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.PositionState,
    );
  });
  it('should provide obstruction detected characteristic', () => {
    const obstructionDetected = mock<ServcieCharacteristic>();
    const blind = new BlindCharacteristics(container, service, api);

    service.getCharacteristic.mockReturnValue(obstructionDetected);

    expect(blind.obstructionDetected).toBe(obstructionDetected);
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.ObstructionDetected,
    );
  });
  it('should provide stopped state', () => {
    const positionState = mock<ServcieCharacteristic>();
    const blind = new BlindCharacteristics(container, service, api);

    service.getCharacteristic.mockReturnValue(positionState);

    positionState.value = platform.api.hap.Characteristic.PositionState.STOPPED;

    expect(blind.stopped).toBeTruthy();
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.PositionState,
    );
  });
  it('should provide usher', () => {
    const blind = new BlindCharacteristics(container, service, api);

    expect(blind.usher).toBeInstanceOf(Delay);
  });
  it('should provide custom usher', () => {
    platform.config.delay = 100;

    const blind = new BlindCharacteristics(container, service, api);
    const usher = blind.usher;

    expect(blind.usher).toBe(usher);
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

    platform.onShutdown.mockImplementation((listener) => {
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

    const blind = new BlindCharacteristics(container, service, api);

    blind.registerListeners();

    expect(name.onGet).toHaveBeenCalled();
    expect(currentPosition.onGet).toHaveBeenCalled();
    expect(targetPosition.onSet).toHaveBeenCalled();
    expect(positionState.onGet).toHaveBeenCalled();
    expect(obstructionDetected.onGet).toHaveBeenCalled();
    expect(platform.onShutdown).toHaveBeenCalled();
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
    const blind = new BlindCharacteristics(container, service, api);

    blind.registerListeners();

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
    const blind = new BlindCharacteristics(container, service, api);

    blind.registerListeners();

    expect(getPosition).toHaveBeenCalled();
  });
  it('should apply position after a short delay on set target position', () => {
    platform.config.delay = 100;

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
    const blind = new BlindCharacteristics(container, service, api);

    blind.registerListeners();

    jest.advanceTimersByTime(100);

    expect(setPosition).toHaveBeenCalledWith(50);
  });

  it('should update name', () => {
    const blind = new BlindCharacteristics(container, service, api);

    blind.updateName('__name__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.Name,
      '__name__',
    );
  });
  it('should update current position', () => {
    const blind = new BlindCharacteristics(container, service, api);

    blind.updateCurrentPosition('__position__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.CurrentPosition,
      '__position__',
    );
  });
  it('should update target position', () => {
    const blind = new BlindCharacteristics(container, service, api);

    blind.updateTargetPosition('__position__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.TargetPosition,
      '__position__',
    );
  });
  it('should update position state', () => {
    const blind = new BlindCharacteristics(container, service, api);

    blind.updatePositionState('__state__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.PositionState,
      '__state__',
    );
  });
  it('should update obstruction detected', () => {
    const blind = new BlindCharacteristics(container, service, api);

    blind.updateObstructionDetected('__obstruction__');

    expect(service.updateCharacteristic).toHaveBeenCalledWith(
      platform.api.hap.Characteristic.ObstructionDetected,
      '__obstruction__',
    );
  });
  it('should get name', async () => {
    const blind = new BlindCharacteristics(container, service, api);

    api.getName.mockResolvedValue('__name__');

    await expect(blind.getName()).resolves.toBe('__name__');
  });
  it('should get position', async () => {
    const blind = new BlindCharacteristics(container, service, api);

    api.getPosition.mockResolvedValue(20.4);

    await expect(blind.getPosition()).resolves.toBe(80);
  });
  it('should set position', async () => {
    const blind = new BlindCharacteristics(container, service, api);

    await blind.setPosition(20.4);

    expect(api.setPosition).toHaveBeenCalledWith(79.6);
  });
  it('should get position state decreasing', async () => {
    const blind = new BlindCharacteristics(container, service, api);

    api.getState.mockResolvedValue(BlindState.DOWN);

    await expect(blind.getPositionState()).resolves.toBe(
      platform.api.hap.Characteristic.PositionState.DECREASING,
    );
    await expect(blind.isDecreasing()).resolves.toBeTruthy();

    api.getState.mockResolvedValue(BlindState.HOLD_DOWN);

    await expect(blind.getPositionState()).resolves.toBe(
      platform.api.hap.Characteristic.PositionState.DECREASING,
    );
    await expect(blind.isDecreasing()).resolves.toBeTruthy();
  });
  it('should get position state increasing', async () => {
    const blind = new BlindCharacteristics(container, service, api);

    api.getState.mockResolvedValue(BlindState.UP);

    await expect(blind.getPositionState()).resolves.toBe(
      platform.api.hap.Characteristic.PositionState.INCREASING,
    );
    await expect(blind.isIncreasing()).resolves.toBeTruthy();

    api.getState.mockResolvedValue(BlindState.HOLD_UP);

    await expect(blind.getPositionState()).resolves.toBe(
      platform.api.hap.Characteristic.PositionState.INCREASING,
    );
    await expect(blind.isIncreasing()).resolves.toBeTruthy();
  });
  it('should get position state stopped', async () => {
    const blind = new BlindCharacteristics(container, service, api);

    api.getState.mockResolvedValue(BlindState.STOP);

    await expect(blind.getPositionState()).resolves.toBe(
      platform.api.hap.Characteristic.PositionState.STOPPED,
    );
    await expect(blind.isStopped()).resolves.toBeTruthy();
  });
  it('should get obstruction detected', async () => {
    const blind = new BlindCharacteristics(container, service, api);

    api.getSumState.mockResolvedValue(BlindSumState.LOCKED);

    await expect(blind.isObstructionDetected()).resolves.toBeTruthy();
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

    const blind = new BlindCharacteristics(container, service, api);

    blind.registerListeners();

    jest.advanceTimersByTime(500);

    await Promise.resolve();

    expect(platform.log.error).toHaveBeenCalledWith('__reason__');
  });
});
