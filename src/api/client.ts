import { get as httpGet } from "http";
import { Blind } from './blind';
import { Meteo } from './meteo';
import { Url } from './url';

type RequestCache = Record<string, { time: number, request: Promise<any> }>;

type ClientConfig = {
    host: string;
    username: string;
    password: string;
    ttl?: number
}

export class Client {

    public readonly apiUrl: Url;

    private readonly cache: RequestCache = {};

    constructor(private readonly config: ClientConfig) {
        this.apiUrl = (new Url(`http://${this.config.host}/api/v1`)).withUsername(this.config.username).withPassword(this.config.password);
    }

    sendRequest(url: Url): Promise<any> {
        return new Promise((resolve, reject) => {
            httpGet(url.toString(), (response) => {
                if (response.statusCode !== 200) {
                    response.resume();
                    reject(new Error(`Request failed. Got status code ${response.statusCode}.`));
                    return;
                }

                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    data = data.trim();

                    if (data !== 'OK') {
                        try {
                            resolve(JSON.parse(data));
                        } catch (error) {
                            reject(error);
                        }
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    sendCachedRequest(url: Url): Promise<any> {
        const key = url.toString();
        const ttl = (this.config.ttl ?? 1) * 1000;

        if (this.cache[key] === undefined || this.cache[key].time + ttl < Date.now()) {
            this.cache[key] = {
                time: Date.now(),
                request: this.sendRequest(url)
            };
        }

        return this.cache[key].request;
    }

    async getMeteo(): Promise<Meteo | undefined> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/var/globals`);
        const data = await this.sendCachedRequest(url);

        if (data.meteo === undefined) {
            return;
        }

        return new Meteo(this);
    }

    async getBlinds(): Promise<Blind[]> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/var/blinds`);
        const data = await this.sendCachedRequest(url);

        return Object.keys(data).map((key: string) => new Blind(this, key, data[key].name), []);
    }

    async getBlind(key: string): Promise<Blind | undefined> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/var/blinds`);
        const data = await this.sendCachedRequest(url);

        if (data[key] === undefined) {
            return;
        }

        return new Blind(this, key, data[key].name);
    }
}
