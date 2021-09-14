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
  it('should update everything on platform heartbeat', async () => {
    const onHeartbeat = jest.spyOn(platform, 'onHeartbeat');
    const updateAll = jest.spyOn(BlindObserver.prototype, 'updateAll');

    const blind = new BlindObserver(container, characteristics);

    blind.registerListeners();

    expect(onHeartbeat).toHaveBeenCalled();
    expect(updateAll).toHaveBeenCalled();
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
  it('should update current position in characteristics', async () => {
    characteristics.name.value = '__name__';
    characteristics.getPosition.mockResolvedValue(50);

    const blind = new BlindObserver(container, characteristics);

    await blind.updateCurrentPosition();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating current position of blind __name__: 50% open',
    );
    expect(characteristics.updateCurrentPosition).toHaveBeenCalledWith(50);
  });
  it('should update decreasing position state in characteristics', async () => {
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
    characteristics.name.value = '__name__';
    characteristics.getPositionState.mockResolvedValue('__stp__');

    const blind = new BlindObserver(container, characteristics);

    await blind.updatePositionState();

    expect(platform.log.debug).toHaveBeenCalledWith(
      'Updating position state of blind __name__: ↕',
    );
    expect(characteristics.updatePositionState).toHaveBeenCalledWith('__stp__');
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
  it('should log error on failed update', async () => {
    jest
      .spyOn(BlindObserver.prototype, 'updateAll')
      .mockRejectedValue('__reason__');

    const blind = new BlindObserver(container, characteristics);

    blind.registerListeners();

    await Promise.resolve();

    expect(platform.log.error).toHaveBeenCalledWith('__reason__');
  });
});
