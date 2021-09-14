import { BlindCharacteristics } from '../characteristics';
import { Container } from '../container';
import { BlindObserver } from './blind.observer';

export class BlindObserverFactory {
  constructor(readonly container: Container) {}

  createObserver(characteristics: BlindCharacteristics): BlindObserver {
    return new BlindObserver(this.container, characteristics);
  }
}
