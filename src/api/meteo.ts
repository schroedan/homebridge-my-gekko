import { Client } from './client';
import { Url } from './url';

export class Meteo {

    public readonly apiUrl: Url;

    constructor(private readonly client: Client) {
        this.apiUrl = this.client.apiUrl.withPathname(`${this.client.apiUrl.pathname}/var/globals/meteo`)
    }

    async getTwilight(): Promise<number> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/status`);
        const data = await this.client.sendCachedRequest(url);

        return parseFloat(data.twilight.value);
    }

    async getHumidity(): Promise<number> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/status`);
        const data = await this.client.sendCachedRequest(url);

        return parseFloat(data.humidity.value);
    }


    async getBrightness(): Promise<number> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/status`);
        const data = await this.client.sendCachedRequest(url);

        return parseFloat(data.brightness.value);
    }

    async getWind(): Promise<number> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/status`);
        const data = await this.client.sendCachedRequest(url);

        return parseFloat(data.wind.value);
    }

    async getTemperature(): Promise<number> {
        const url = this.apiUrl.withPathname(`${this.apiUrl.pathname}/status`);
        const data = await this.client.sendCachedRequest(url);

        return parseFloat(data.temperature.value);
    }
}
