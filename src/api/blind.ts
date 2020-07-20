import { Client } from './client';
import { Url } from './url';

export declare const enum BlindState {
    HOLD_DOWN = '-2',
    DOWN = '-1',
    STOP = '0',
    UP = '1',
    HOLD_UP = '2',
}

export declare const enum BlindSumState {
    OK = '0',
    MANUAL_OFF = '1',
    MANUAL_ON = '2',
    LOCKED = '3',
    ALARM = '4',
}

export class Blind {

    public readonly apiUrl: Url;

    constructor(private readonly client: Client, public readonly key: string, public readonly name: string) {
        this.apiUrl = this.client.apiUrl.withPathname(`${this.client.apiUrl.pathname}/var/blinds`)
    }

    private async getStatus(): Promise<string> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/status`);
        const data = await this.client.sendCachedRequest(url);

        return data[this.key].sumstate.value;
    }

    async getState(): Promise<BlindState> {
        const status = await this.getStatus();

        return status.split(';')[0] as BlindState;
    }

    async setState(state: BlindState): Promise<void> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/${this.key}/scmd/set`)
            .withSearchParam('value', state);

        return await this.client.sendRequest(url);
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
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/${this.key}/scmd/set`)
            .withSearchParam('value', 'T');

        return await this.client.sendRequest(url);
    }

    async getPosition(): Promise<number> {
        const status = await this.getStatus();

        return parseInt(status.split(';')[1]);
    }

    async setPosition(position: number): Promise<void> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/${this.key}/scmd/set`)
            .withSearchParam('value', `P${position.toFixed(2)}`);

        return await this.client.sendRequest(url);
    }

    async getAngle(): Promise<number> {
        const status = await this.getStatus();

        return parseInt(status.split(';')[2]);
    }

    async setAngle(angle: number): Promise<void> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/${this.key}/scmd/set`)
            .withSearchParam('value', `S${angle.toFixed(0)}`);

        return await this.client.sendRequest(url);
    }

    async getSumState(): Promise<BlindSumState> {
        const status = await this.getStatus();

        return status.split(';')[3] as BlindSumState;
    }

    async getSlatRotationArea(): Promise<number> {
        const status = await this.getStatus();

        return parseInt(status.split(';')[4]);
    }
}
