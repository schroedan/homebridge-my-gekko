import { URL } from 'url';

export class Url {

    private readonly url: URL;

    constructor(input: string) {
        this.url = new URL(input);
    }

    get pathname(): string {
        return this.url.pathname;
    }

    toString(): string {
        return this.url.toString();
    }

    withUsername(username: string): Url {
        const url = new URL(this.toString());

        url.username = username;

        return new Url(url.toString());
    }

    withPassword(password: string): Url {
        const url = new URL(this.toString());

        url.password = password;

        return new Url(url.toString());
    }

    withPathname(pathname: string): Url {
        const url = new URL(this.toString());

        url.pathname = pathname;

        return new Url(url.toString());
    }

    withSearchParam(name: string, value: string): Url {
        const url = new URL(this.toString());

        url.searchParams.set(name, value);

        return new Url(url.toString());
    }
}
