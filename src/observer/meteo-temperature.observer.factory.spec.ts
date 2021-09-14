import { mock, MockProxy } from 'jest-mock-extended';
import { MeteoTemperatureCharacteristics } from '../characteristics';
import { Container } from '../container';
import { MeteoTemperatureObserver } from './meteo-temperature.observer';
import { MeteoTemperatureObserverFactory } from './meteo-temperature.observer.factory';

describe('Meteo Temperature Observer Factory', () => {
  let container: MockProxy<Container>;
  beforeEach(() => {
    container = mock<Container>();
  });
  it('should create observer', async () => {
    const characteristics = mock<MeteoTemperatureCharacteristics>();

    const meteoTemperature = new MeteoTemperatureObserverFactory(container);

    expect(meteoTemperature.createObserver(characteristics)).toBeInstanceOf(
      MeteoTemperatureObserver,
    );
  });
});
