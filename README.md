# homebridge-my-gekko

[![NPM Version](https://img.shields.io/npm/v/homebridge-my-gekko.svg)](https://www.npmjs.com/package/homebridge-my-gekko)
[![NPM Downloads](https://img.shields.io/npm/dt/homebridge-my-gekko.svg)](https://www.npmjs.com/package/homebridge-my-gekko)
[![Continuous Integration](https://img.shields.io/github/workflow/status/schroedan/homebridge-my-gekko/Continuous%20Integration)](https://github.com/schroedan/homebridge-my-gekko/actions/workflows/continuous-integration.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/schroedan/4136c781b460695ffcbf3dd43f5b82bc/raw/homebridge-my-gekko-coverage.json)](https://github.com/schroedan/homebridge-my-gekko/actions/workflows/continuous-integration.yml)

myGEKKO Platform Plugin for Homebridge

This plugin exposes:

- Blinds as window coverings
- Meteo temperature as temperature sensor

## Installation

Follow the Homebridge installation instructions [here](https://www.npmjs.com/package/homebridge#installing-plugins).

Install this plugin globally:

    npm install -g homebridge-my-gekko

Add platform to `config.json`, for configuration see below.

## Configuration

```json
{
  "platforms": [
    {
      "name": "myGEKKO",
      "host": "<host>",
      "username": "<username>",
      "password": "<password>",
      "platform": "mygekko",
      "blinds": true,
      "meteo": true,
      "ttl": 1,
      "interval": 3,
      "deferance": 10,
      "delay": 500
    }
  ]
}
```

Either the IP or the hostname of your myGEKKO can be configured as `host`. Please ensure that the local QueryAPI is enabled.
The `username` and `password` must be defined in the local QueryAPI settings of your myGEKKO.

The discovery of blind and/or meteo accessories can be disabled by setting the `blinds` and/or `meteo` options to `false`.

Feel free to adjust the options for client cache TTL (`ttl` in seconds), update interval (`interval` in seconds), allocation deferance (`deferance` in seconds) and allocation delay (`delay` in milliseconds).

## Debugging

If you experience problems with this plugin please provide a Homebridge logfile by running Homebridge with debugging enabled:

    homebridge -D

## Acknowledgements

- Original non-working [Homebridge Platform for myGEKKO](https://github.com/isnogudus/homebridge-mygekko)
- Platform plugin implementation inspired by [Dynamic Platform Plugin](https://github.com/homebridge/homebridge-examples) example
