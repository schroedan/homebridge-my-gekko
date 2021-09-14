import {
  Characteristic as ServcieCharacteristic,
  CharacteristicValue,
  Service,
} from 'homebridge';
import { Meteo as MeteoAPI } from '../api';
import { Container } from '../container';

let Characteristic: typeof ServcieCharacteristic;

export class MeteoTemperatureCharacteristics {
  get currentTemperature(): ServcieCharacteristic {
    return this.service.getCharacteristic(Characteristic.CurrentTemperature);
  }

  constructor(
    readonly container: Container,
    readonly service: Service,
    readonly api: MeteoAPI,
  ) {
    Characteristic = container.platform.api.hap.Characteristic;
  }

  registerListeners(): void {
    this.currentTemperature.onGet(() => this.getTemperature());
  }

  updateCurrentTemperature(value: CharacteristicValue): this {
    this.service.updateCharacteristic(Characteristic.CurrentTemperature, value);
    return this;
  }

  async getTemperature(): Promise<CharacteristicValue> {
    const data = await this.api.getTemperature();
    return data.value;
  }

  async getUnit(): Promise<CharacteristicValue> {
    const data = await this.api.getTemperature();
    return data.unit;
  }
}
