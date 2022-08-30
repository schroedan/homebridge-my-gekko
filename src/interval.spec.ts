import { Interval } from './interval';

describe('Interval', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => 1487076708000);
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  it('should increase the timer 3 times', () => {
    const interval = new Interval<() => void>(100);
    let counter = 0;

    interval.set(() => {
      counter = counter + 1;
    });

    jest.advanceTimersByTime(300);

    expect(counter).toEqual(3);
  });
  it('should provide timestamp', () => {
    const interval = new Interval<() => void>(100);
    let counter = 0;

    interval.set(() => {
      counter = counter + 1;
    });

    expect(interval.timestamp).toEqual(0);

    jest.advanceTimersByTime(300);

    expect(interval.timestamp).toEqual(1487076708);
  });
  it('should clear previous delay', () => {
    const delay = new Interval<() => void>(100);
    let counter = 0;

    delay.set(() => {
      counter = counter + 1;
    });

    delay.set(() => {
      counter = counter + 10;
    });

    jest.advanceTimersByTime(200);

    expect(counter).toEqual(20);
  });
});
