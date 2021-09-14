import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { receive } from './receive';

describe('receive', () => {
  it('should provide data from message', async () => {
    const message = new IncomingMessage(new Socket());
    message.statusCode = 200;

    const data = receive(message);

    message.emit('data', '__data__');
    message.emit('end');

    await expect(data).resolves.toEqual('__data__');
  });
  it('should provide error from message', async () => {
    const message = new IncomingMessage(new Socket());
    message.statusCode = 200;

    const data = receive(message);
    const error = new Error('__error__');

    message.emit('error', error);

    await expect(data).rejects.toEqual(error);
  });
  it('should provide error about message status code', async () => {
    const message = new IncomingMessage(new Socket());
    message.statusCode = 400;

    const data = receive(message);

    await expect(data).rejects.toEqual(
      new Error('Receiving message failed. Got status code 400.'),
    );
  });
});
