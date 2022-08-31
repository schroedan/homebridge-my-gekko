import {
  API,
  Characteristic as ServcieCharacteristic,
  CharacteristicValue,
  Service,
} from 'homebridge';
import { MeteoAPI } from '../api';

let Characteristic: typeof ServcieCharacteristic;

export class MeteoBrightnessCharacteristics {
  get currentAmbientLightLevel(): ServcieCharacteristic {
    return this.service.getCharacteristic(
      Characteristic.CurrentAmbientLightLevel,
    );
  }

  constructor(
    readonly api: API,
    readonly service: Service,
    readonly meteo: MeteoAPI,
  ) {
    Characteristic = api.hap.Characteristic;
  }

  registerListeners(): void {
    this.currentAmbientLightLevel
      .setProps({ minValue: 0.0, maxValue: Math.pow(2, 16) - 1.0 })
      .onGet(() => this.getCurrentAmbientLightLevel());
  }

  updateCurrentAmbientLightLevel(value: CharacteristicValue): this {
    this.service.updateCharacteristic(
      Characteristic.CurrentAmbientLightLevel,
      value,
    );
    return this;
  }

  async getCurrentAmbientLightLevel(): Promise<CharacteristicValue> {
    const data = await this.meteo.getSouthBrightness();
    return data.unit === 'kLx'
      ? Math.max(0.0001, data.value * 1000)
      : data.value;
  }

  async getUnit(): Promise<CharacteristicValue> {
    const data = await this.meteo.getSouthBrightness();
    return data.unit === 'kLx' ? 'Lux' : data.unit;
  }
}
