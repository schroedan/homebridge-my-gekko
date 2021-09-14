import { IncomingMessage } from 'http';

export function receive(message: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    if (message.statusCode !== 200) {
      message.resume();
      reject(
        new Error(
          `Receiving message failed. Got status code ${message.statusCode}.`,
        ),
      );
      return;
    }

    let data = '';

    message.on('data', (chunk) => {
      data += chunk;
    });

    message.on('error', (err) => {
      reject(err);
    });

    message.on('end', () => {
      resolve(data);
    });
  });
}
