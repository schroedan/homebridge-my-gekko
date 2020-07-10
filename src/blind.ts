import { Client } from './client';
import Timeout = NodeJS.Timeout;

export declare const enum BlindState {
    HOLD_DOWN = '-2',
    DOWN = '-1',
    STOP = '0',
    UP = '1',
    HOLD_UP = '2'
}

export class Blind {

    private readonly client: Client;
    public readonly key: string;
    public readonly data: any;
    private positionWatcher: Timeout | undefined;

    constructor(client: Client, key: string, data: any) {
        this.client = client;
        this.key = key;
        this.data = data;
    }

    get name(): string {
        return this.data.name;
    }

    getState(): Promise<BlindState> {
        return this.client.sendRequest('/var/blinds/status')
            .then((data) => data[this.key].sumstate.value.split(';')[0]);
    }

    setState(state: BlindState): Promise<void> {
        return this.client.sendRequest(`/var/blinds/${this.key}/scmd/set`, {
            value: state
        });
    }

    holdDown(): Promise<void> {
        return this.setState(BlindState.HOLD_DOWN);
    }

    down(): Promise<void> {
        return this.setState(BlindState.DOWN);
    }

    stop(): Promise<void> {
        return this.setState(BlindState.STOP);
    }

    up(): Promise<void> {
        return this.setState(BlindState.UP);
    }

    holdUp(): Promise<void> {
        return this.setState(BlindState.HOLD_UP);
    }

    toggle(): Promise<void> {
        return this.client.sendRequest(`/var/blinds/${this.key}/scmd/set`, {
            value: 'T'
        });
    }

    getPosition(): Promise<number> {
        return this.client.sendRequest('/var/blinds/status')
            .then((data) => data[this.key].sumstate.value.split(';')[1] * 1);
    }

    setPosition(position: number): Promise<void> {
        return this.client.sendRequest(`/var/blinds/${this.key}/scmd/set`, {
            value: `P${position.toFixed(2)}`
        });
    }

    watchPosition(callback: (position: number) => void, interval: number = 500): void {
        this.unwatchPosition();
        this.positionWatcher = setInterval(() => {
            this.getPosition()
                .then(callback)
        }, interval);
    }

    unwatchPosition(): void {
        if (this.positionWatcher === undefined) {
            return;
        }

        clearInterval(this.positionWatcher);
        this.positionWatcher = undefined;
    }

    getAngle(): Promise<number> {
        return this.client.sendRequest('/var/blinds/status')
            .then((data) => data[this.key].sumstate.value.split(';')[2] * 1);
    }

    setAngle(angle: number): Promise<void> {
        return this.client.sendRequest(`/var/blinds/${this.key}/scmd/set`, {
            value: `S${angle.toFixed(0)}`
        });
    }
}
