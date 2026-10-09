import { MockProxy, mock } from 'jest-mock-extended';

import { Container } from '../../container';
import { Delay } from '../../delay';
import { Interval } from '../../interval';
import { PlatformEventEmitter } from '../../platform-events';
import { UUID } from '../../uuid';
import { DeepPartial } from './deep-partial';

// Container exposes the whole homebridge API, which makes DeepPartial<Container>
// too deep to instantiate, so it only accepts shallow properties
export const mockContainer = (
  props?: Partial<Container>,
): MockProxy<Container> => Object.assign(mock<Container>(), props);

export const mockDelay = <T extends CallableFunction = () => void>(
  props?: DeepPartial<Delay<T>>,
): MockProxy<Delay<T>> => mock<Delay<T>>(props);

export const mockInterval = <T extends CallableFunction = () => void>(
  props?: DeepPartial<Interval<T>>,
): MockProxy<Interval<T>> => mock<Interval<T>>(props);

export const mockPlatformEventEmitter = (
  props?: DeepPartial<PlatformEventEmitter>,
): MockProxy<PlatformEventEmitter> => mock<PlatformEventEmitter>(props);

export const mockUUID = (props?: DeepPartial<UUID>): MockProxy<UUID> =>
  mock<UUID>(props);
