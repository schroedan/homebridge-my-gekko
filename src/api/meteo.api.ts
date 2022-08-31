import { QueryAPI } from './query.api';

export type MeteoResourceValue = {
  description: string;
  format: string;
  type: 'AI';
  permission: 'READ';
  index: number;
};

export type MeteoResource = {
  twilight: MeteoResourceValue;
  brightness: MeteoResourceValue;
  brightnessw: MeteoResourceValue;
  brightnesso: MeteoResourceValue;
  wind: MeteoResourceValue;
  temperature: MeteoResourceValue;
  rain: MeteoResourceValue;
};

export type MeteoStatusValue = {
  value: string;
};

export type MeteoStatus = {
  twilight: MeteoStatusValue;
  brightness: MeteoStatusValue;
  brightnessw: MeteoStatusValue;
  brightnesso: MeteoStatusValue;
  wind: MeteoStatusValue;
  temperature: MeteoStatusValue;
  rain: MeteoStatusValue;
};

export type MeteoDataValue = {
  value: number;
  unit: string;
};

export class MeteoAPI {
  constructor(readonly api: QueryAPI) {}

  protected async getResource(): Promise<MeteoResource> {
    const resources = await this.api.getResources();

    if (resources.globals.meteo === undefined) {
      throw new Error('Invalid resource.');
    }

    return resources.globals.meteo;
  }

  protected async getStatus(): Promise<MeteoStatus> {
    const status = await this.api.getStatus();

    if (status.globals.meteo === undefined) {
      throw new Error('Invalid status.');
    }

    return status.globals.meteo;
  }

  protected convertFormatToUnit(format: string): string {
    const groups = format.match(/[a-z]+\[[0-9-\.]+,[0-9-\.]+\]\((.+)\)/);
    const unit = (groups || []).pop();

    if (unit === undefined) {
      return 'n/a';
    }

    return unit;
  }

  async getTwilight(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.twilight.value),
      unit: this.convertFormatToUnit(resource.twilight.format),
    };
  }

  async getSouthBrightness(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.brightness.value),
      unit: this.convertFormatToUnit(resource.brightness.format),
    };
  }

  async getWestBrightness(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.brightnessw.value),
      unit: this.convertFormatToUnit(resource.brightnessw.format),
    };
  }

  async getEastBrightness(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.brightnesso.value),
      unit: this.convertFormatToUnit(resource.brightnesso.format),
    };
  }

  async getWind(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.wind.value),
      unit: this.convertFormatToUnit(resource.wind.format),
    };
  }

  async getTemperature(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.temperature.value),
      unit: this.convertFormatToUnit(resource.temperature.format),
    };
  }

  async getRain(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.rain.value),
      unit: this.convertFormatToUnit(resource.rain.format),
    };
  }
}
