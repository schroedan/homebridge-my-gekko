import { MeteoTemperatureCharacteristics } from '../characteristics';
import { Container } from '../container';
import { MeteoTemperatureObserver } from './meteo-temperature.observer';

export class MeteoTemperatureObserverFactory {
  constructor(readonly container: Container) {}

  createObserver(
    characteristics: MeteoTemperatureCharacteristics,
  ): MeteoTemperatureObserver {
    return new MeteoTemperatureObserver(this.container, characteristics);
  }
}
