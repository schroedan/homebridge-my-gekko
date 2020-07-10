import { get as httpGet } from "http";
import { URL } from 'url';
import { Blind } from './blind';

export class Client {

    private readonly apiUrl: URL;

    constructor(host: string, username: string, password: string) {
        this.apiUrl = new URL(`http://${host}/api/v1`);
        this.apiUrl.username = username;
        this.apiUrl.password = password;
    }

    sendRequest(subPath: string, params: { [name: string]: string } = {}): Promise<any> {
        const url = new URL(this.apiUrl.toString());

        url.pathname += subPath;

        Object.keys(params).forEach((name) => {
            url.searchParams.set(name, params[name]);
        });

        return new Promise((resolve, reject) => {
            httpGet(url, (response) => {
                if (response.statusCode !== 200) {
                    response.resume();
                    reject(new Error(`Request failed. Got status code ${response.statusCode}.`));
                }

                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    data = data.trim();

                    if (data === 'OK') {
                        resolve({});
                        return;
                    }

                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    getBlinds(): Promise<Blind[]> {
        return this.sendRequest('/var/blinds')
            .then((data) => Object.keys(data).map((key: string) => new Blind(this, key, data[key]), []));
    }
}
