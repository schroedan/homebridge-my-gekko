import { BlindCharacteristics } from '../characteristics';
import { Container } from '../container';

export class BlindObserver {
  get allocationDeferred(): boolean {
    const deferance = this.container.platform.config.deferance ?? 60;

    if (this.characteristics.usher.pending) {
      return true;
    }

    return (
      this.container.heartbeat.timestamp -
        this.characteristics.usher.timestamp <
      deferance
    );
  }

  constructor(
    readonly container: Container,
    readonly characteristics: BlindCharacteristics,
  ) {}

  registerListeners(): void {
    this.container.platform.onHeartbeat(() => {
      Promise.all([
        this.updateName(),
        this.updateCurrentPosition(),
        this.updateTargetPosition(),
        this.updatePositionState(),
        this.updateObstructionDetected(),
      ]).catch((reason) => {
        this.container.platform.log.error(reason);
      });
    });
  }

  async updateName(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.getName();

    if (this.characteristics.name.value === value) {
      return;
    }

    this.container.platform.log.debug(
      `Updating name of blind ${name}: ${value}`,
    );

    this.characteristics.updateName(value);
  }

  async updateCurrentPosition(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.getPosition();

    if (
      this.allocationDeferred ||
      this.characteristics.currentPosition.value === value
    ) {
      return;
    }

    this.container.platform.log.debug(
      `Updating current position of blind ${name}: ${value}% open`,
    );

    this.characteristics.updateCurrentPosition(value);
  }

  async updateTargetPosition(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.getPosition();

    if (
      this.allocationDeferred ||
      this.characteristics.targetPosition.value === value
    ) {
      return;
    }

    this.container.platform.log.debug(
      `Updating target position of blind ${name}: ${value}% open`,
    );

    this.characteristics.updateTargetPosition(value);
  }

  async updatePositionState(): Promise<void> {
    const name = this.characteristics.name.value || 'unnamed';
    const value = await this.characteristics.getPositionState();

    if (
      this.allocationDeferred ||
      this.characteristics.positionState.value === value
    ) {
      return;
    }

    if (await this.characteristics.isDecreasing()) {
      this.container.platform.log.debug(
        `Updating position state of blind ${name}: ↓`,
      );
    } else if (await this.characteristics.isIncreasing()) {
      this.container.platform.log.debug(
        `Updating position state of blind ${name}: ↑`,
      );
    } else {
      this.container.platform.log.debug(
        `Updating position state of blind ${name}: ↕`,
      );
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
      this.container.platform.log.debug(
        `Updating obstruction detected of blind ${name}: ✗`,
      );
    } else {
      this.container.platform.log.debug(
        `Updating obstruction detected of blind ${name}: ✓`,
      );
    }

    this.characteristics.updateObstructionDetected(value);
  }
}
