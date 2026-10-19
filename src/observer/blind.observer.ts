import { Logging, PlatformConfig } from 'homebridge';

import { BlindCharacteristics } from '../characteristics';
import { describeError } from '../describe-error';
import { Interval } from '../interval';
import { PlatformEventEmitter } from '../platform-events';

export class BlindObserver {
  get allocationDeferred(): boolean {
    if (this.characteristics.commands.pending) {
      return true;
    }

    return (
      this.heartbeat.timestamp - this.characteristics.commands.timestamp <
      this.config.deferance
    );
  }

  constructor(
    readonly characteristics: BlindCharacteristics,
    readonly eventEmitter: PlatformEventEmitter,
    readonly logger: Logging,
    readonly heartbeat: Interval<() => void>,
    readonly config: PlatformConfig,
  ) {}

  registerListeners(): void {
    this.eventEmitter.onHeartbeat(() => {
      Promise.all([
        this.updateName(),
        this.updateCurrentPosition(),
        this.updateTargetPosition(),
        this.updatePositionState(),
        this.updateObstructionDetected(),
      ]).catch((reason) => {
        this.logger.error(describeError(reason));
      });
    });
  }

  async updateName(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.getName();

    if (this.characteristics.name.value === value) {
      return;
    }

    this.logger.debug(`Updating name of blind ${name}: ${value}`);

    this.characteristics.updateName(value);
  }

  async updateCurrentPosition(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.getPosition();

    if (this.characteristics.currentPosition.value === value) {
      return;
    }

    this.logger.debug(`Updating current position of blind ${name}: ${value}%`);

    this.characteristics.updateCurrentPosition(value);
  }

  async updateTargetPosition(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.getPosition();

    // keep the target of a recent command and do not follow intermediate
    // positions while the blind is moving
    if (
      this.allocationDeferred ||
      this.characteristics.targetPosition.value === value ||
      !(await this.characteristics.isStopped())
    ) {
      return;
    }

    this.logger.debug(`Updating target position of blind ${name}: ${value}%`);

    this.characteristics.updateTargetPosition(value);
  }

  async updatePositionState(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.getPositionState();

    if (this.characteristics.positionState.value === value) {
      return;
    }

    if (await this.characteristics.isDecreasing()) {
      this.logger.debug(`Updating position state of blind ${name}: ↓`);
    } else if (await this.characteristics.isIncreasing()) {
      this.logger.debug(`Updating position state of blind ${name}: ↑`);
    } else {
      this.logger.debug(`Updating position state of blind ${name}: ↕`);
    }

    this.characteristics.updatePositionState(value);
  }

  async updateObstructionDetected(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.isObstructionDetected();

    if (this.characteristics.obstructionDetected.value === value) {
      return;
    }

    if (value) {
      this.logger.debug(`Updating obstruction detected of blind ${name}: ✗`);
    } else {
      this.logger.debug(`Updating obstruction detected of blind ${name}: ✓`);
    }

    this.characteristics.updateObstructionDetected(value);
  }
}
