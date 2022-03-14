# onecall (Openweathermap)

[![Platform](https://img.shields.io/badge/platform-MagicMirror2-informational)](https://github.com/hangorazvan/MagicMirror2)
[![CC-0 license](https://img.shields.io/badge/License-CC--4.0-blue.svg)](https://creativecommons.org/licenses/by-nd/4.0)
[![GitHub branches](https://badgen.net/github/branches/hangorazvan/onecall)](https://github.com/hangorazvan/onecall)
[![GitHub forks](https://badgen.net/github/forks/hangorazvan/onecall)](https://github.com/hangorazvan/onecall)
[![GitHub stars](https://badgen.net/github/stars/hangorazvan/onecall)](https://github.com/hangorazvan/onecall)

https://github.com/hangorazvan/onecall

Modified MagicMirror2 original current & forecast weather module based on Openweathermap with Onecall endpoint and compliments. 

As the name suggests this module call only once your appid no matter how many instances are loaded, for current, hourly or daily, it uses the onecall endpoint for which reason it was designed for.

However the module can work without oneLoader and in this case it must be deactivated via <i>oneLoader: false</i> and configure latitude, longitude and appid for each instance used.

Keep in mind that this module is for my personal use with specific css styling or settings and not necessarily for sharing so don't create issues or pull requests.

Do not make modification and do not replace the default module, just add <i>disabled: true</i> in config.js and use this one as 3rd party.

	{
		module: "weather", 
		position: "top_right",
		disabled: true,			// disabled module
		config: {
			// no needed anyore
		}
	},

#### Onecall API loader and single instance

<img src=https://github.com/hangorazvan/onecall/blob/master/onecall.png width="300">

(appid2 is optional for https://github.com/hangorazvan/pollution)

	{
		module: "onecall/loader",
		config: {
			lat: "",                               // your location latitude,
			lon: "",                               // your location longitude,
			appid: "",                             // your Openweathermap appid
			appid2: "",                            // optional for Pollution module
			backup: "",                            // optional backup appid
			dayUpdateInterval: 10 * 60 * 1000,     // every 10 minutes
			nightUpdateInterval: 15 * 60 * 1000,   // every 15 minutes
		}
	},
	{
		module: "onecall",
		position: "top_right",
		classes: "current weather",
		config: {
			flexDayForecast: false,     // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfHours: 3,
			maxNumberOfDays: 6,
			extraHourly: true,          // snow extra hourly humidity, dew point, pressure, real feel and rain or snow,
			extraDaily: true,           // snow extra daily humidity, dew point, pressure, real feel and rain or snow,
			endpointType: "onecall",    // "current", "hourly", "daily" or "onecall"
			oneLoader: true,            // very important for just one API call
		}
	},

#### Current weather

<img src=https://github.com/hangorazvan/onecall/blob/master/current.png width="500">

	{
		module: "onecall",
		position: "top_right",
		header: "Current Weather",
		classes: "current weather",
		config: {
			// current settings
			showWindDirection: true,
			showWindDirectionAsArrow: false,
			useBeaufort: false,
			useKMPHwind: true,
			showFeelsLike: true,
			showVisibility: true,
			showHumidity: true,
			showPressure: true,
			showDew: true,              // dew point
			showUvi: true,              // UV index
			showDescription: true,
			showAlerts: false,
			defaultIcons: false,        // with or without default icons
			showRainAmount: true,       // snow show only in winter months
			endpointType: "current",    // "current", "hourly", "daily" or "onecall"
			oneLoader: true,            // very important for just one API call
		}
	},

#### Hourly forecast (3 hours)

<img src=https://github.com/hangorazvan/onecall/blob/master/hourly.png width="500">

	{
		module: "onecall",
		position: "top_right",
		header: "Cuurrent weather and forecast",
		classes: "hourly",
		config: {

			// hourly & daily settings
			flexDayForecast: true,        // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfHours: 3,
			extraHourly: true,            // snow extra hourly humidity, dew point, pressure, real feel and rain or snow,
			hourly: "HH.mm",              // "HH [h]" for hourly forecast or "HH.mm" for hour and minutes
			endpointType: "hourly",       // "current", "hourly", "daily" or "onecall"
			oneLoader: true,              // very important for just one API call
		}
	},

#### Daily forecast (6 days)

<img src=https://github.com/hangorazvan/onecall/blob/master/daily.png width="400">

	{
		module: "onecall",
		position: "top_right",
		disabled: false,
		header: "Daily Weather Forecast",
		classes: "daily",
		config: {

			// hourly & daily settings
			flexDayForecast: true,      // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfDays: 6,
			extraDaily: true,           // snow extra daily humidity, dew point, pressure, real feel and rain or snow,
			daily: "dddd",              // "ddd" for short day name or "dddd" for full day name
			endpointType: "daily",      // "current", "hourly", "daily" or "onecall"
			oneLoader: true,            // very important for just one API call
		}
	},

#### Classic icons and separate 3 instances without oneLoader (not recommanded)

<img src=https://github.com/hangorazvan/onecall/blob/master/icons.png width="300">

	{
		module: "onecall",
		position: "top_right",
		header: "Current Weather",
		classes: "current weather",
		config: {
			lat: "",                               // your location latitude,
			lon: "",                               // your location longitude,
			appid: "",                             // your Openweathermap appid
			// current settings
			defaultIcons: true,
			endpointType: "current",     // "current", "hourly", "daily" or "onecall"
			oneLoader: false,            // very important for just one API call
		}
	},

	{
		module: "onecall",
		position: "top_right",
		header: "Cuurrent weather and forecast",
		classes: "hourly",
		config: {
			lat: "",                               // your location latitude,
			lon: "",                               // your location longitude,
			appid: "",                             // your Openweathermap appid
			// hourly & daily settings
			defaultIcons: true,
			flexDayForecast: true,       // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfHours: 3,
			endpointType: "hourly",      // "current", "hourly", "daily" or "onecall"
			oneLoader: false,            // very important for just one API call
		}
	},

	{
		module: "onecall",
		position: "top_right",
		header: "Daily Weather Forecast",
		classes: "daily",
		config: {
			lat: "",                               // your location latitude,
			lon: "",                               // your location longitude,
			appid: "",                             // your Openweathermap appid
			// hourly & daily settings
			defaultIcons: true,
			flexDayForecast: true,       // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfDays: 6,
			endpointType: "daily",       // "current", "hourly", "daily" or "onecall"
			oneLoader: false,            // very important for just one API call
		}
	},

#### Single instance with table forecast (8 hours and 8 days)

<img src=https://github.com/hangorazvan/onecall/blob/master/table.png width="300">

	{
		module: "onecall/loader",
		config: {
			lat: "",                               // your location latitude,
			lon: "",                               // your location longitude,
			appid: "",                             // your Openweathermap appid
		}
	},
	{
		module: "onecall",
		position: "top_right",
		classes: "current weather",
		disabled: false,
		config: {
			flexDayForecast: false,     // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfHours: 8,
			maxNumberOfDays: 8,
			hourly: "HH.mm",            // "HH [h]" for hourly forecast or "HH.mm" for hour and minutes
			daily: "dddd",              // "ddd" for short day name or "dddd" for full day name
			fade: true,
			fadePoint: 0.25,            // Start on 1/4th of the list.
			colored: true,
			extraHourly: false,         // snow extra hourly humidity, dew point, pressure, real feel and rain or snow,
			extraDaily: true,           // snow extra daily humidity, dew point, pressure, real feel and rain or snow,
			endpointType: "onecall",    // "current", "hourly", "daily" or "onecall"
			oneLoader: true,            // very important for just one API call
		}
	},

Weather compliments to put in your config.js
<br>You need to use my compliments_plus to work with onecall compliments
https://github.com/hangorazvan/compliments_plus

	compliments: {		
		day_sunny : [
			"<i class=\"gold wi wi-day-sunny\"></i> Sunny",
		],
		day_cloudy : [
			"<i class=\"lightblue wi wi-day-cloudy\"></i> Cloudy",
		],
		cloudy : [
			"<i class=\"skyblue wi wi-cloudy\"></i> Cloudy",
		],
		day_cloudy_windy : [
			"<i class=\"powderblue wi wi-day-cloudy-windy\"></i> Cloudy windy",
		],
		day_showers : [
			"<i class=\"skyblue wi wi-day-showers\"></i> Showers",
		],
		day_rain : [
			"<i class=\"deepskyblue wi wi-day-rain\"></i> Raining",
		],
		day_thunderstorm : [
			"<i class=\"dodgerblue wi wi-day-thunderstorm\"></i> Thunderstorm!",
		],
		day_snow : [
			"<i class=\"normal wi wi-day-snow\"></i> Snowing",
		],
		day_fog : [
			"<i class=\"bright wi wi-day-fog\"></i> Fog",
		],
		night_clear : [
			"<i class=\"dimmed wi wi-night-clear\"></i> Clear night",
		],
		night_cloudy : [
			"<i class=\"powderblue wi wi-night-cloudy\"></i> Cloudy night",
		],
		night_alt_cloudy : [
			"<i class=\"powderblue wi wi-night-alt-cloudy\"></i> Cloudy night",
		],
		night_alt_showers : [
			"<i class=\"skyblue wi wi-night-alt-showers\"></i> Night showers",
		],
		night_alt_rain : [
			"<i class=\"deepskyblue wi wi-night-alt-rain\"></i> Raining night",
		],
		night_alt_thunderstorm : [
			"<i class=\"royalblue wi wi-night-alt-thunderstorm\"></i> Thunderstorm!",
		],
		night_alt_snow : [
			"<i class=\"normal wi wi-night-alt-snow\"></i> Snowing night",
		],
		night_alt_cloudy_windy : [
			"<i class=\"skyblue wi wi-night-alt-cloudy-windy\"></i> Clouds and fog",
		],
	}

Redesigned by Răzvan Cristea
https://github.com/hangorazvan
Creative Commons BY-NC-SA 4.0, Romania.
