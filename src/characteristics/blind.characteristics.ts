import {
  API,
  CharacteristicValue,
  Logging,
  PlatformConfig,
  Characteristic as ServcieCharacteristic,
  Service,
} from 'homebridge';

import { BlindAPI, BlindState, BlindSumState } from '../api';
import { describeError } from '../describe-error';
import { LatestTaskQueue } from '../latest-task-queue';
import { PlatformEventEmitter } from '../platform-events';

let Characteristic: typeof ServcieCharacteristic;

export class BlindCharacteristics {
  private _commands?: LatestTaskQueue;

  get name(): ServcieCharacteristic {
    return this.service.getCharacteristic(Characteristic.Name);
  }

  get currentPosition(): ServcieCharacteristic {
    return this.service.getCharacteristic(Characteristic.CurrentPosition);
  }

  get targetPosition(): ServcieCharacteristic {
    return this.service.getCharacteristic(Characteristic.TargetPosition);
  }

  get positionState(): ServcieCharacteristic {
    return this.service.getCharacteristic(Characteristic.PositionState);
  }

  get obstructionDetected(): ServcieCharacteristic {
    return this.service.getCharacteristic(Characteristic.ObstructionDetected);
  }

  get commands(): LatestTaskQueue {
    if (this._commands === undefined) {
      this._commands = new LatestTaskQueue(this.config.delay);
    }

    return this._commands;
  }

  constructor(
    readonly api: API,
    readonly service: Service,
    readonly blind: BlindAPI,
    readonly config: PlatformConfig,
    readonly logger: Logging,
    readonly eventEmitter: PlatformEventEmitter,
  ) {
    Characteristic = api.hap.Characteristic;
  }

  registerListeners(): void {
    this.name.onGet(() => this.getName());

    this.currentPosition.onGet(() => this.getPosition());

    this.targetPosition.onSet((value: CharacteristicValue) => this.applyPosition(value));

    this.positionState.onGet(() => this.getPositionState());

    this.obstructionDetected.onGet(() => this.isObstructionDetected());

    this.eventEmitter.onShutdown(() => {
      this.commands.clear();
    });
  }

  updateName(value: CharacteristicValue): this {
    this.service.updateCharacteristic(Characteristic.Name, value);
    return this;
  }

  updateCurrentPosition(value: CharacteristicValue): this {
    this.service.updateCharacteristic(Characteristic.CurrentPosition, value);
    return this;
  }

  updateTargetPosition(value: CharacteristicValue): this {
    this.service.updateCharacteristic(Characteristic.TargetPosition, value);
    return this;
  }

  updatePositionState(value: CharacteristicValue): this {
    this.service.updateCharacteristic(Characteristic.PositionState, value);
    return this;
  }

  updateObstructionDetected(value: CharacteristicValue): this {
    this.service.updateCharacteristic(
      Characteristic.ObstructionDetected,
      value,
    );
    return this;
  }

  async getName(): Promise<CharacteristicValue> {
    return await this.blind.getName();
  }

  async getPosition(): Promise<CharacteristicValue> {
    return Math.round(100 - (await this.blind.getPosition()));
  }

  applyPosition(value: CharacteristicValue): void {
    const name = this.name.value || 'unnamed';

    // wait for the target to settle, e.g. while moving a slider, and send one
    // command at a time, so that commands cannot overtake each other on their
    // way to the myGEKKO, skipping those superseded in the meantime
    this.commands
      .enqueue(async () => {
        this.logger.debug(
          `Sending target position of blind ${name}: ${value}%`,
        );
        await this.setPosition(value);
        this.logger.debug(`Sent target position of blind ${name}: ${value}%`);
      })
      .then((executed) => {
        if (!executed) {
          this.logger.debug(
            `Skipping superseded target position of blind ${name}: ${value}%`,
          );
        }
      })
      .catch((reason) => {
        this.logger.error(describeError(reason));
      });
  }

  async setPosition(value: CharacteristicValue): Promise<void> {
    await this.blind.setPosition(100 - Number(value));
  }

  async getPositionState(): Promise<CharacteristicValue> {
    switch (await this.blind.getState()) {
      case BlindState.HOLD_DOWN:
      case BlindState.DOWN:
        return Characteristic.PositionState.DECREASING;
      case BlindState.HOLD_UP:
      case BlindState.UP:
        return Characteristic.PositionState.INCREASING;
      default:
        return Characteristic.PositionState.STOPPED;
    }
  }

  async isDecreasing(): Promise<boolean> {
    const state = await this.blind.getState();
    return state === BlindState.HOLD_DOWN || state === BlindState.DOWN;
  }

  async isIncreasing(): Promise<boolean> {
    const state = await this.blind.getState();
    return state === BlindState.HOLD_UP || state === BlindState.UP;
  }

  async isStopped(): Promise<boolean> {
    return (await this.blind.getState()) === BlindState.STOP;
  }

  async isObstructionDetected(): Promise<boolean> {
    return BlindSumState.OK !== (await this.blind.getSumState());
  }
}
