import {
  API,
  CharacteristicValue,
  Characteristic as ServcieCharacteristic,
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
    this.currentAmbientLightLevel.onGet(() =>
      this.getCurrentAmbientLightLevel(),
    );
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
    return Math.min(
      Math.max(
        this.currentAmbientLightLevel.props.minValue || 0.0001,
        data.unit === 'kLx' ? data.value * 1000 : data.value,
      ),
      this.currentAmbientLightLevel.props.maxValue || 100000,
    );
  }

  async getUnit(): Promise<CharacteristicValue> {
    const data = await this.meteo.getSouthBrightness();
    return data.unit === 'kLx' ? 'Lux' : data.unit;
  }
}
