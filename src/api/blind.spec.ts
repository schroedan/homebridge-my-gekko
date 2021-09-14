import { mock, MockProxy } from 'jest-mock-extended';
import { API, Resources, Status } from './api';
import { Blind, BlindState, BlindSumState } from './blind';
import { Client, WriteRequest } from './client';

describe('Blind', () => {
  const resources: Resources = {
    globals: {},
    blinds: {
      item0: {
        name: '__blind__',
        page: '__page__',
        sumstate: {
          value: '__sumstate__',
          type: 'STRING',
          permission: 'READ',
          index: 0,
        },
        scmd: {
          value: '__scmd__',
          type: 'STRING',
          permission: 'WRITE',
          index: 0,
        },
      },
    },
  };
  const status: Status = {
    globals: {},
    blinds: {
      item0: {
        sumstate: {
          value: '__sumstate__;0;90;0;10',
        },
      },
    },
  };
  let client: MockProxy<Client>;
  let api: MockProxy<API>;
  beforeEach(() => {
    client = mock<Client>();
    api = mock<API>({ client });
  });
  it('should provide API', () => {
    const blind = new Blind(api, 'item0');

    expect(blind.api).toBe(api);
  });
  it('should get name', async () => {
    const blind = new Blind(api, 'item0');

    api.getResources.mockResolvedValue(resources);

    await expect(blind.getName()).resolves.toBe('__blind__');
  });
  it('should throw an error for invalid resource', async () => {
    const blind = new Blind(api, 'item1');

    api.getResources.mockResolvedValue(resources);

    await expect(blind.getName()).rejects.toThrow('Invalid resource.');
  });
  it('should get page', async () => {
    const blind = new Blind(api, 'item0');

    api.getResources.mockResolvedValue(resources);

    await expect(blind.getPage()).resolves.toBe('__page__');
  });
  it('should get state', async () => {
    const blind = new Blind(api, 'item0');

    api.getStatus.mockResolvedValue(status);

    await expect(blind.getState()).resolves.toBe('__sumstate__');
  });
  it('should throw an error for invalid status', async () => {
    const blind = new Blind(api, 'item1');

    api.getStatus.mockResolvedValue(status);

    await expect(blind.getState()).rejects.toThrow('Invalid status.');
  });
  it('should set state', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.setState(BlindState.STOP)).resolves.not.toThrow();
  });
  it('should handle hold down state', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.holdDown()).resolves.not.toThrow();
  });
  it('should handle down state', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.down()).resolves.not.toThrow();
  });
  it('should handle stop state', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.stop()).resolves.not.toThrow();
  });
  it('should handle up state', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.up()).resolves.not.toThrow();
  });
  it('should handle hold up state', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.holdUp()).resolves.not.toThrow();
  });
  it('should handle toggle status', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.toggle()).resolves.not.toThrow();
  });
  it('should get position', async () => {
    const blind = new Blind(api, 'item0');

    api.getStatus.mockResolvedValue(status);

    await expect(blind.getPosition()).resolves.toBe(0);
  });
  it('should set position', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.setPosition(0)).resolves.not.toThrow();
  });
  it('should get angle', async () => {
    const blind = new Blind(api, 'item0');

    api.getStatus.mockResolvedValue(status);

    await expect(blind.getAngle()).resolves.toBe(90);
  });
  it('should set angle', async () => {
    const blind = new Blind(api, 'item0');
    const request = mock<WriteRequest>();

    request.withPath.mockReturnValue(request);
    request.withParams.mockReturnValue(request);

    client.writeRequest.mockReturnValue(request);

    await expect(blind.setAngle(90)).resolves.not.toThrow();
  });
  it('should get sum state', async () => {
    const blind = new Blind(api, 'item0');

    api.getStatus.mockResolvedValue(status);

    await expect(blind.getSumState()).resolves.toBe(BlindSumState.OK);
  });
  it('should get slat rotation area', async () => {
    const blind = new Blind(api, 'item0');

    api.getStatus.mockResolvedValue(status);

    await expect(blind.getSlatRotationArea()).resolves.toBe(10);
  });
});
