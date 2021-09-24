import { PlatformEventEmitter, PlatformEventTypes } from './platform-events';

describe('Platform Events', () => {
  it('should init with 0 max listeners', () => {
    const eventEmitter = new PlatformEventEmitter();

    expect(eventEmitter.getMaxListeners()).toBe(0);
  });
  it('should register on heartbeat listener', () => {
    const on = jest.spyOn(PlatformEventEmitter.prototype, 'on');
    const listener = jest.fn();

    const eventEmitter = new PlatformEventEmitter();

    eventEmitter.onHeartbeat(listener);

    expect(eventEmitter.getMaxListeners()).toBe(1);
    expect(on).toHaveBeenCalledWith(PlatformEventTypes.HEARTBEAT, listener);
  });
  it('should register on shutdown listener', () => {
    const on = jest.spyOn(PlatformEventEmitter.prototype, 'on');
    const listener = jest.fn();

    const eventEmitter = new PlatformEventEmitter();

    eventEmitter.onShutdown(listener);

    expect(eventEmitter.getMaxListeners()).toBe(1);
    expect(on).toHaveBeenCalledWith(PlatformEventTypes.SHUTDOWN, listener);
  });
  it('should signal heartbeat', () => {
    const emit = jest.spyOn(PlatformEventEmitter.prototype, 'emit');

    const eventEmitter = new PlatformEventEmitter();

    eventEmitter.signalHeartbeat();

    expect(emit).toHaveBeenCalledWith(PlatformEventTypes.HEARTBEAT);
  });
  it('should signal shutdown', () => {
    const emit = jest.spyOn(PlatformEventEmitter.prototype, 'emit');

    const eventEmitter = new PlatformEventEmitter();

    eventEmitter.signalShutdown();

    expect(emit).toHaveBeenCalledWith(PlatformEventTypes.SHUTDOWN);
  });
});
