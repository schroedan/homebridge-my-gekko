import { Logging } from 'homebridge';
import { mock, MockProxy } from 'jest-mock-extended';
import { BlindCharacteristics } from '../characteristics';
import { Container } from '../container';
import { Platform } from '../platform';
import { BlindObserver } from './blind.observer';

describe('Blind Observer', () => {
  let platform: MockProxy<Platform>;
  let container: MockProxy<Container>;
  let characteristics: MockProxy<BlindCharacteristics>;
  beforeEach(() => {
    platform = mock<Platform>({
      log: mock<Logging>(),
      onHeartbeat: (listener) => {
        listener();
      },
    });
    container = mock<Container>({ platform });
    characteristics = mock<BlindCharacteristics>();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should provide container and characteristics', () => {
    const blind = new BlindObserver(container, characteristics);

    expect(blind.container).toBe(container);
    expect(blind.characteristics).toBe(characteristics);
  });
  it('should return that allocation is deferred', () => {
    platform.config.deferance = 10;

    characteristics = mock<BlindCharacteristics>({ usher: { pending: true } });

    const blind = new BlindObserver(container, characteristics);

    expect(blind.allocationDeferred).toBe(true);
  });
  it('should update name on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(platform, 'onHeartbeat');
    const updateName = jest.spyOn(BlindObserver.prototype, 'updateName');

    const blind = new BlindObserver(container, characteristics);

    blind.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateName).toHaveBeenCalled();
  });
  it('should update current position on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(platform, 'onHeartbeat');
    const updateCurrentPosition = jest.spyOn(
      BlindObserver.prototype,
      'updateCurrentPosition',
    );

    const blind = new BlindObserver(container, characteristics);

    blind.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateCurrentPosition).toHaveBeenCalled();
  });
  it('should update target position on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(platform, 'onHeartbeat');
    const updateTargetPosition = jest.spyOn(
      BlindObserver.prototype,
      'updateTargetPosition',
    );

    const blind = new BlindObserver(container, characteristics);

    blind.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateTargetPosition).toHaveBeenCalled();
  });
  it('should update position state on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(platform, 'onHeartbeat');
    const updatePositionState = jest.spyOn(
      BlindObserver.prototype,
      'updatePositionState',
    );

    const blind = new BlindObserver(container, characteristics);

    blind.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updatePositionState).toHaveBeenCalled();
  });
  it('should update obstruction detected on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(platform, 'onHeartbeat');
    const updateObstructionDetected = jest.spyOn(
      BlindObserver.prototype,
      'updateObstructionDetected',
    );

    const blind = new BlindObserver(container, characteristics);

    blind.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateObstructionDetected).toHaveBeenCalled();
  });
  it('should update name in characteristics', async () => {
    characteristics.name.value = '__old_name__';
    characteristics.getName.mockResolvedValue('__new_name__');

    const blind = new BlindObserver(container, characteristics);

    await blind.updateName();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating name of blind __old_name__: __new_name__',
    );
    expect(characteristics.updateName).toHaveBeenCalledWith('__new_name__');
  });
  it('should not update name in characteristics for same name', async () => {
    characteristics.name.value = '__name__';
    characteristics.getName.mockResolvedValue('__name__');

    const blind = new BlindObserver(container, characteristics);

    await blind.updateName();

    expect(characteristics.updateName).not.toHaveBeenCalled();
  });
  it('should update current position in characteristics', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(false);

    characteristics.name.value = '__name__';
    characteristics.getPosition.mockResolvedValue(50);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateCurrentPosition();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating current position of blind __name__: 50% open',
    );
    expect(characteristics.updateCurrentPosition).toHaveBeenCalledWith(50);
  });
  it('should not update current position in characteristics when allocation is deferred', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(true);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateCurrentPosition();

    expect(characteristics.updateCurrentPosition).not.toHaveBeenCalled();
  });
  it('should not update current position in characteristics for same position', async () => {
    characteristics.currentPosition.value = 50;
    characteristics.getPosition.mockResolvedValue(50);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateCurrentPosition();

    expect(characteristics.updateCurrentPosition).not.toHaveBeenCalled();
  });
  it('should update target position in characteristics', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(false);

    characteristics.name.value = '__name__';
    characteristics.getPosition.mockResolvedValue(50);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateTargetPosition();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating target position of blind __name__: 50% open',
    );
    expect(characteristics.updateTargetPosition).toHaveBeenCalledWith(50);
  });
  it('should not update target position in characteristics when allocation is deferred', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(true);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateTargetPosition();

    expect(characteristics.updateTargetPosition).not.toHaveBeenCalled();
  });
  it('should not update target position in characteristics for same position', async () => {
    characteristics.targetPosition.value = 50;
    characteristics.getPosition.mockResolvedValue(50);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateTargetPosition();

    expect(characteristics.updateTargetPosition).not.toHaveBeenCalled();
  });
  it('should update decreasing position state in characteristics', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(false);

    characteristics.name.value = '__name__';
    characteristics.getPositionState.mockResolvedValue('__dec__');
    characteristics.isDecreasing.mockResolvedValue(true);

    const blind = new BlindObserver(container, characteristics);

    await blind.updatePositionState();

    expect(platform.log.debug).toHaveBeenCalledWith(
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

    const blind = new BlindObserver(container, characteristics);

    await blind.updatePositionState();

    expect(platform.log.debug).toHaveBeenCalledWith(
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

    const blind = new BlindObserver(container, characteristics);

    await blind.updatePositionState();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating position state of blind __name__: ↕',
    );
    expect(characteristics.updatePositionState).toHaveBeenCalledWith('__stp__');
  });
  it('should not update position state in characteristics when allocation is deferred', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'allocationDeferred', 'get')
      .mockReturnValue(true);

    const blind = new BlindObserver(container, characteristics);

    await blind.updatePositionState();

    expect(characteristics.updatePositionState).not.toHaveBeenCalled();
  });
  it('should not update position state in characteristics for same position state', async () => {
    characteristics.positionState.value = '__dec__';
    characteristics.getPositionState.mockResolvedValue('__dec__');

    const blind = new BlindObserver(container, characteristics);

    await blind.updatePositionState();

    expect(characteristics.updatePositionState).not.toHaveBeenCalled();
  });
  it('should update obstruction is detected in characteristics', async () => {
    characteristics.name.value = '__name__';
    characteristics.isObstructionDetected.mockResolvedValue(true);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateObstructionDetected();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating obstruction detected of blind __name__: ✗',
    );
    expect(characteristics.updateObstructionDetected).toHaveBeenCalledWith(
      true,
    );
  });
  it('should update obstruction not detected in characteristics', async () => {
    characteristics.name.value = '__name__';
    characteristics.isObstructionDetected.mockResolvedValue(false);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateObstructionDetected();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating obstruction detected of blind __name__: ✓',
    );
    expect(characteristics.updateObstructionDetected).toHaveBeenCalledWith(
      false,
    );
  });
  it('should not update obstruction is detected in characteristics for same state', async () => {
    characteristics.obstructionDetected.value = false;
    characteristics.isObstructionDetected.mockResolvedValue(false);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateObstructionDetected();

    expect(characteristics.updateObstructionDetected).not.toHaveBeenCalled();
  });
  it('should log error on failed update', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'updateName')
      .mockRejectedValue('__reason__');

    const blind = new BlindObserver(container, characteristics);

    blind.registerListeners();

    await new Promise(setImmediate);

    expect(platform.log.error).toHaveBeenCalledWith('__reason__');
  });
});
