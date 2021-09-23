import {
  Characteristic as ServcieCharacteristic,
  CharacteristicValue,
  Service,
} from 'homebridge';
import { Blind as BlindAPI, BlindState, BlindSumState } from '../api';
import { Container } from '../container';
import { Delay } from '../delay';

let Characteristic: typeof ServcieCharacteristic;

export class BlindCharacteristics {
  private _usher?: Delay<() => void>;

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

  get usher(): Delay<() => void> {
    if (this._usher === undefined) {
      this._usher = new Delay(this.container.platform.config.delay ?? 500);
    }

    return this._usher;
  }

  constructor(
    readonly container: Container,
    readonly service: Service,
    readonly api: BlindAPI,
  ) {
    Characteristic = container.platform.api.hap.Characteristic;
  }

  registerListeners(): void {
    this.name.onGet(() => this.getName());

    this.currentPosition.onGet(() => this.getPosition());

    this.targetPosition.onSet((value: CharacteristicValue) => {
      this.usher.set(() => {
        this.setPosition(value).catch((reason) => {
          this.container.platform.log.error(reason);
        });
      });
    });

    this.positionState.onGet(() => this.getPositionState());

    this.obstructionDetected.onGet(() => this.isObstructionDetected());

    this.container.platform.onShutdown(() => {
      this.usher.clear();
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
    return await this.api.getName();
  }

  async getPosition(): Promise<CharacteristicValue> {
    return Math.round(100 - (await this.api.getPosition()));
  }

  async setPosition(value: CharacteristicValue): Promise<void> {
    await this.api.setPosition(100 - Number(value));
  }

  async getPositionState(): Promise<CharacteristicValue> {
    switch (await this.api.getState()) {
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
    const state = await this.api.getState();
    return state === BlindState.HOLD_DOWN || state === BlindState.DOWN;
  }

  async isIncreasing(): Promise<boolean> {
    const state = await this.api.getState();
    return state === BlindState.HOLD_UP || state === BlindState.UP;
  }

  async isStopped(): Promise<boolean> {
    return (await this.api.getState()) === BlindState.STOP;
  }

  async isObstructionDetected(): Promise<boolean> {
    return BlindSumState.OK !== (await this.api.getSumState());
  }
}
