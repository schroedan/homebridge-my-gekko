import { API } from './api';

export type MeteoResourceValue = {
  value: 'Act.Value';
  type: 'REAL';
  unit: string;
  permission: 'READ';
  index: number;
};

export type MeteoResource = {
  twilight: MeteoResourceValue;
  humidity: MeteoResourceValue;
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
  humidity: MeteoStatusValue;
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

export class Meteo {
  constructor(readonly api: API) {}

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

  async getTwilight(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.twilight.value),
      unit: resource.twilight.unit,
    };
  }

  async getHumidity(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.humidity.value),
      unit: resource.humidity.unit,
    };
  }

  async getBrightness(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.brightness.value),
      unit: resource.brightness.unit,
    };
  }

  async getWind(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.wind.value),
      unit: resource.wind.unit,
    };
  }

  async getTemperature(): Promise<MeteoDataValue> {
    const resource = await this.getResource();
    const status = await this.getStatus();

    return {
      value: Number(status.temperature.value),
      unit: resource.temperature.unit,
    };
  }
}
