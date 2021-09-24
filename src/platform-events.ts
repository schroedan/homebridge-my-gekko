import EventEmitter from 'events';

export const enum PlatformEventTypes {
  /**
   * This event is fired in the configured interval.
   * At this stage all PlatformAccessories are already registered and ready!
   */
  HEARTBEAT = 'heartbeat',
  /**
   * This event is fired when homebridge got shutdown. This could be a regular shutdown or a unexpected crash.
   * At this stage all Accessories are already unpublished and all PlatformAccessories are already saved to disk!
   */
  SHUTDOWN = 'shutdown',
}

export class PlatformEventEmitter extends EventEmitter {
  constructor() {
    super();

    this.setMaxListeners(0);
  }

  onHeartbeat(listener: () => void): void {
    this.setMaxListeners(this.getMaxListeners() + 1);
    this.on(PlatformEventTypes.HEARTBEAT, listener);
  }

  onShutdown(listener: () => void): void {
    this.setMaxListeners(this.getMaxListeners() + 1);
    this.on(PlatformEventTypes.SHUTDOWN, listener);
  }

  signalHeartbeat(): void {
    this.emit(PlatformEventTypes.HEARTBEAT);
  }

  signalShutdown(): void {
    this.emit(PlatformEventTypes.SHUTDOWN);
  }
}
