import {
  API,
  Characteristic as ServcieCharacteristic,
  CharacteristicValue,
  Service,
} from 'homebridge';
import { MeteoAPI } from '../api';

let Characteristic: typeof ServcieCharacteristic;

export class MeteoTemperatureCharacteristics {
  get currentTemperature(): ServcieCharacteristic {
    return this.service.getCharacteristic(Characteristic.CurrentTemperature);
  }

  constructor(
    readonly api: API,
    readonly service: Service,
    readonly meteo: MeteoAPI,
  ) {
    Characteristic = api.hap.Characteristic;
  }

  registerListeners(): void {
    this.currentTemperature.onGet(() => this.getTemperature());
  }

  updateCurrentTemperature(value: CharacteristicValue): this {
    this.service.updateCharacteristic(Characteristic.CurrentTemperature, value);
    return this;
  }

  async getTemperature(): Promise<CharacteristicValue> {
    const data = await this.meteo.getTemperature();
    return data.value;
  }

  async getUnit(): Promise<CharacteristicValue> {
    const data = await this.meteo.getTemperature();
    return data.unit;
  }
}
