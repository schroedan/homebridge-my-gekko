import { mock, MockProxy } from 'jest-mock-extended';
import { BlindCharacteristics } from '../characteristics';
import { Container } from '../container';
import { BlindObserver } from './blind.observer';
import { BlindObserverFactory } from './blind.observer.factory';

describe('Blind Observer Factory', () => {
  let container: MockProxy<Container>;
  beforeEach(() => {
    container = mock<Container>();
  });
  it('should create observer', async () => {
    const characteristics = mock<BlindCharacteristics>();

    const blind = new BlindObserverFactory(container);

    expect(blind.createObserver(characteristics)).toBeInstanceOf(BlindObserver);
  });
});
