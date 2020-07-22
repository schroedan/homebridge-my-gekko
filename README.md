# homebridge-my-gekko

[![NPM Version](https://img.shields.io/npm/v/homebridge-my-gekko.svg)](https://www.npmjs.com/package/homebridge-my-gekko)
[![NPM Downloads](https://img.shields.io/npm/dt/homebridge-my-gekko.svg)](https://www.npmjs.com/package/homebridge-my-gekko)
[![Build Status](https://travis-ci.com/schroedan/homebridge-my-gekko.svg?branch=master)](https://travis-ci.com/schroedan/homebridge-my-gekko)

myGEKKO platform plugin for Homebridge written in Typescript

This plugin exposes:
* Blinds as window coverings
* Meteo temperature as temperature sensor

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
      "platform": "myGEKKO",
      "host": "<host>",
      "username": "<username>",
      "password": "<password>",
      "ttl": 1,
      "interval": 60,
      "delay": 500,
      "debug": false,
      "names": {
        "meteo": {
          "temperature": "Temperature"
        }
      } 
    }
  ]
}
```

The `host` address can be the IP or the hostname of your myGEKKO. Please ensure that the local QueryAPI is enabled.
The `username` and `password` must be defined in the local QueryAPI settings of your myGEKKO.

Feel free to adjust the options for client cache TTL (`ttl`), update interval (`interval`) and allocation delay (`delay`).

Some names for unnamed accessories (e.g. temperature sensor) can be defined via the `names` object.

## Debugging

If you experience problems with this plugin please provide a Homebridge logfile by running Homebridge with debugging enabled:

    homebridge -D

For even more detailed logs set `"debug": true` in the platform configuration.

## Acknowledgements

- Original non-working [Homebridge platform for myGEKKO](https://github.com/isnogudus/homebridge-mygekko)
- Platform plugin implementation inspired by [dynamic platform example in Typescript](https://github.com/homebridge/homebridge-examples)
