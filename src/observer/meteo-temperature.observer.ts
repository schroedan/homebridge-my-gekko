import { MeteoTemperatureCharacteristics } from '../characteristics';
import { Container } from '../container';

export class MeteoTemperatureObserver {
  constructor(
    readonly container: Container,
    readonly characteristics: MeteoTemperatureCharacteristics,
  ) {}

  registerListeners(): void {
    this.container.platform.onHeartbeat(() => {
      this.updateCurrentTemperature().catch((reason) => {
        this.container.platform.log.error(reason);
      });
    });
  }

  async updateCurrentTemperature(): Promise<void> {
    const value = await this.characteristics.getTemperature();
    const unit = await this.characteristics.getUnit();

    if (this.characteristics.currentTemperature.value === value) {
      return;
    }

    this.container.platform.log.debug(
      `Updating current temperature of meteo: ${value} ${unit}`,
    );

    this.characteristics.updateCurrentTemperature(value);
  }
}
