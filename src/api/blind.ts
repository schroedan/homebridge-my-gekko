import { API } from './api';

export type BlindResource = {
  name: string;
  page: string;
  sumstate: {
    value: string;
    type: 'STRING';
    permission: 'READ';
    index: number;
  };
  scmd: {
    value: string;
    type: 'STRING';
    permission: 'WRITE';
    index: number;
  };
};

export type BlindStatusValue = {
  value: string;
};

export type BlindStatus = {
  sumstate: BlindStatusValue;
};

export enum BlindState {
  HOLD_DOWN = '-2',
  DOWN = '-1',
  STOP = '0',
  UP = '1',
  HOLD_UP = '2',
}

export enum BlindSumState {
  OK = '0',
  MANUAL_OFF = '1',
  MANUAL_ON = '2',
  LOCKED = '3',
  ALARM = '4',
}

export class Blind {
  constructor(readonly api: API, readonly key: string) {}

  protected async getResource(): Promise<BlindResource> {
    const resources = await this.api.getResources();

    if (
      resources.blinds === undefined ||
      resources.blinds[this.key] === undefined
    ) {
      throw new Error('Invalid resource.');
    }

    return resources.blinds[this.key];
  }

  protected async getStatus(): Promise<BlindStatus> {
    const status = await this.api.getStatus();

    if (status.blinds === undefined || status.blinds[this.key] === undefined) {
      throw new Error('Invalid status.');
    }

    return status.blinds[this.key];
  }

  protected async setStatus(value: string): Promise<void> {
    const request = this.api.client
      .writeRequest()
      .withPath(`/var/blinds/${this.key}/scmd/set`)
      .withParams([{ name: 'value', value }]);

    await this.api.client.query(request);
  }

  async getName(): Promise<string> {
    const resource = await this.getResource();

    return resource.name;
  }

  async getPage(): Promise<string> {
    const resource = await this.getResource();

    return resource.page;
  }

  async getState(): Promise<BlindState> {
    const status = await this.getStatus();

    return status.sumstate.value.split(';')[0] as BlindState;
  }

  async setState(state: BlindState): Promise<void> {
    await this.setStatus(state);
  }

  async holdDown(): Promise<void> {
    return await this.setState(BlindState.HOLD_DOWN);
  }

  async down(): Promise<void> {
    return await this.setState(BlindState.DOWN);
  }

  async stop(): Promise<void> {
    return await this.setState(BlindState.STOP);
  }

  async up(): Promise<void> {
    return await this.setState(BlindState.UP);
  }

  async holdUp(): Promise<void> {
    return await this.setState(BlindState.HOLD_UP);
  }

  async toggle(): Promise<void> {
    await this.setStatus('T');
  }

  async getPosition(): Promise<number> {
    const status = await this.getStatus();

    return Number(status.sumstate.value.split(';')[1]);
  }

  async setPosition(position: number): Promise<void> {
    await this.setStatus(`P${position.toFixed(2)}`);
  }

  async getAngle(): Promise<number> {
    const status = await this.getStatus();

    return Number(status.sumstate.value.split(';')[2]);
  }

  async setAngle(angle: number): Promise<void> {
    await this.setStatus(`S${angle.toFixed(0)}`);
  }

  async getSumState(): Promise<BlindSumState> {
    const status = await this.getStatus();

    return status.sumstate.value.split(';')[3] as BlindSumState;
  }

  async getSlatRotationArea(): Promise<number> {
    const status = await this.getStatus();

    return Number(status.sumstate.value.split(';')[4]);
  }
}
