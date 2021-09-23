import { Delay } from './delay';

describe('Delay', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => 1487076708000);
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should increase counter once after time', () => {
    const delay = new Delay<() => void>(100);
    let counter = 0;

    delay.set(() => {
      counter = counter + 1;
    });

    jest.advanceTimersByTime(300);

    expect(counter).toEqual(1);
  });
  it('should provide timestamp', () => {
    const delay = new Delay<() => void>(100);
    let counter = 0;

    delay.set(() => {
      counter = counter + 1;
    });

    expect(delay.timestamp).toEqual(0);

    jest.advanceTimersByTime(300);

    expect(delay.timestamp).toEqual(1487076708);
  });
  it('should indicate pending state', () => {
    const delay = new Delay<() => void>(100);
    let counter = 0;

    delay.set(() => {
      counter = counter + 1;
    });

    expect(delay.pending).toEqual(true);

    jest.advanceTimersByTime(300);

    expect(delay.pending).toEqual(false);
  });
  it('should clear previous delay', () => {
    const delay = new Delay<() => void>(100);
    let counter = 0;

    delay.set(() => {
      counter = counter + 1;
    });

    delay.set(() => {
      counter = counter + 10;
    });

    jest.advanceTimersByTime(200);

    expect(counter).toEqual(10);
  });
});
