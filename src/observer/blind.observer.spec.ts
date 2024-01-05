import { Logging, PlatformConfig } from 'homebridge';
import { MockProxy, mock } from 'jest-mock-extended';

import { BlindCharacteristics } from '../characteristics';
import { Interval } from '../interval';
import { PlatformEventEmitter } from '../platform-events';
import { BlindObserver } from './blind.observer';

describe('Blind Observer', () => {
  let characteristics: MockProxy<BlindCharacteristics>;
  let eventEmitter: MockProxy<PlatformEventEmitter>;
  let logger: MockProxy<Logging>;
  let heartbeat: MockProxy<Interval<() => void>>;
  let config: MockProxy<PlatformConfig>;

  beforeEach(() => {
    characteristics = mock<BlindCharacteristics>();
    eventEmitter = mock<PlatformEventEmitter>({
      onHeartbeat: (listener) => {
        listener();
      },
    });
    logger = mock<Logging>();
    heartbeat = mock<Interval<() => void>>();
    config = mock<PlatformConfig>();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should provide characteristics, event emitter, logger, heartbeat and config', () => {
    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    expect(observer.characteristics).toBe(characteristics);
    expect(observer.eventEmitter).toBe(eventEmitter);
    expect(observer.logger).toBe(logger);
    expect(observer.heartbeat).toBe(heartbeat);
    expect(observer.config).toBe(config);
  });
  it('should return that allocation is deferred', () => {
    config.deferance = 10;

    characteristics = mock<BlindCharacteristics>({ usher: { pending: true } });

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    expect(observer.allocationDeferred).toBe(true);
  });
  it('should update name on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(eventEmitter, 'onHeartbeat');
    const updateName = jest.spyOn(BlindObserver.prototype, 'updateName');

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    observer.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateName).toHaveBeenCalled();
  });
  it('should update current position on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(eventEmitter, 'onHeartbeat');
    const updateCurrentPosition = jest.spyOn(
      BlindObserver.prototype,
      'updateCurrentPosition',
    );

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    observer.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateCurrentPosition).toHaveBeenCalled();
  });
  it('should update target position on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(eventEmitter, 'onHeartbeat');
    const updateTargetPosition = jest.spyOn(
      BlindObserver.prototype,
      'updateTargetPosition',
    );

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    observer.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateTargetPosition).toHaveBeenCalled();
  });
  it('should update position state on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(eventEmitter, 'onHeartbeat');
    const updatePositionState = jest.spyOn(
      BlindObserver.prototype,
      'updatePositionState',
    );

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    observer.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updatePositionState).toHaveBeenCalled();
  });
  it('should update obstruction detected on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(eventEmitter, 'onHeartbeat');
    const updateObstructionDetected = jest.spyOn(
      BlindObserver.prototype,
      'updateObstructionDetected',
    );

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    observer.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateObstructionDetected).toHaveBeenCalled();
  });
  it('should update name in characteristics', async () => {
    characteristics.name.value = '__old_name__';
    characteristics.getName.mockResolvedValue('__new_name__');

    const blind = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await blind.updateName();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating name of blind __old_name__: __new_name__',
    );
    expect(characteristics.updateName).toHaveBeenCalledWith('__new_name__');
  });
  it('should not update name in characteristics for same name', async () => {
    characteristics.name.value = '__name__';
    characteristics.getName.mockResolvedValue('__name__');

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateName();

    expect(characteristics.updateName).not.toHaveBeenCalled();
  });
  it('should update current position in characteristics', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(false);

    characteristics.name.value = '__name__';
    characteristics.getPosition.mockResolvedValue(50);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateCurrentPosition();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating current position of blind __name__: 50%',
    );
    expect(characteristics.updateCurrentPosition).toHaveBeenCalledWith(50);
  });
  it('should not update current position in characteristics when allocation is deferred', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(true);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateCurrentPosition();

    expect(characteristics.updateCurrentPosition).not.toHaveBeenCalled();
  });
  it('should not update current position in characteristics for same position', async () => {
    characteristics.currentPosition.value = 50;
    characteristics.getPosition.mockResolvedValue(50);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateCurrentPosition();

    expect(characteristics.updateCurrentPosition).not.toHaveBeenCalled();
  });
  it('should update target position in characteristics', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(false);

    characteristics.name.value = '__name__';
    characteristics.getPosition.mockResolvedValue(50);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateTargetPosition();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating target position of blind __name__: 50%',
    );
    expect(characteristics.updateTargetPosition).toHaveBeenCalledWith(50);
  });
  it('should not update target position in characteristics when allocation is deferred', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(true);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateTargetPosition();

    expect(characteristics.updateTargetPosition).not.toHaveBeenCalled();
  });
  it('should not update target position in characteristics for same position', async () => {
    characteristics.targetPosition.value = 50;
    characteristics.getPosition.mockResolvedValue(50);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateTargetPosition();

    expect(characteristics.updateTargetPosition).not.toHaveBeenCalled();
  });
  it('should update decreasing position state in characteristics', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(false);

    characteristics.name.value = '__name__';
    characteristics.getPositionState.mockResolvedValue('__dec__');
    characteristics.isDecreasing.mockResolvedValue(true);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updatePositionState();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating position state of blind __name__: ↓',
    );
    expect(characteristics.updatePositionState).toHaveBeenCalledWith('__dec__');
  });
  it('should update increasing position state in characteristics', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(false);

    characteristics.name.value = '__name__';
    characteristics.getPositionState.mockResolvedValue('__inc__');
    characteristics.isIncreasing.mockResolvedValue(true);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updatePositionState();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating position state of blind __name__: ↑',
    );
    expect(characteristics.updatePositionState).toHaveBeenCalledWith('__inc__');
  });
  it('should update stopped position state in characteristics', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(false);

    characteristics.name.value = '__name__';
    characteristics.getPositionState.mockResolvedValue('__stp__');

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updatePositionState();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating position state of blind __name__: ↕',
    );
    expect(characteristics.updatePositionState).toHaveBeenCalledWith('__stp__');
  });
  it('should not update position state in characteristics when allocation is deferred', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(true);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updatePositionState();

    expect(characteristics.updatePositionState).not.toHaveBeenCalled();
  });
  it('should not update position state in characteristics for same position state', async () => {
    characteristics.positionState.value = '__dec__';
    characteristics.getPositionState.mockResolvedValue('__dec__');

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updatePositionState();

    expect(characteristics.updatePositionState).not.toHaveBeenCalled();
  });
  it('should update obstruction is detected in characteristics', async () => {
    characteristics.name.value = '__name__';
    characteristics.isObstructionDetected.mockResolvedValue(true);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateObstructionDetected();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating obstruction detected of blind __name__: ✗',
    );
    expect(characteristics.updateObstructionDetected).toHaveBeenCalledWith(
      true,
    );
  });
  it('should update obstruction not detected in characteristics', async () => {
    characteristics.name.value = '__name__';
    characteristics.isObstructionDetected.mockResolvedValue(false);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateObstructionDetected();

    expect(logger.debug).toHaveBeenCalledWith(
      'Updating obstruction detected of blind __name__: ✓',
    );
    expect(characteristics.updateObstructionDetected).toHaveBeenCalledWith(
      false,
    );
  });
  it('should not update obstruction is detected in characteristics for same state', async () => {
    characteristics.obstructionDetected.value = false;
    characteristics.isObstructionDetected.mockResolvedValue(false);

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    await observer.updateObstructionDetected();

    expect(characteristics.updateObstructionDetected).not.toHaveBeenCalled();
  });
  it('should log error on failed update', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'updateName')
      .mockRejectedValue('__reason__');

    const observer = new BlindObserver(
      characteristics,
      eventEmitter,
      logger,
      heartbeat,
      config,
    );

    observer.registerListeners();

    await new Promise(setImmediate);

    expect(logger.error).toHaveBeenCalledWith('__reason__');
  });
});
