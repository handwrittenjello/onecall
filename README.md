# onecall (Openweathermap)

https://github.com/hangorazvan/onecall

Modified MagicMirror2 current & forecast weather module based on Openweathermap with Onecall endpoint

Do not make modification and do not replace the default, just add <i>disabled: true</i> in config.js and use this one as 3rd party, then put in config.js.

Current weather with onecall

<img src=https://github.com/hangorazvan/onecall/blob/main/current.png>

	{
		module: "weather", 
		position: "top_right",
		disabled: true,
		config: {
			// no needed anyore
		}
	}, 
	{
		module: "onecall",
		position: "top_right",
		disabled: false,        // not necessary
		header: "Current Weather",
		classes: "current weather",
		config: {
			// you cand skip these settings if they are by default
			lat: "",		// your location latitude,
			lon: "",		// your location longitude,
			location: "",		// your location,
			appid: "",		// your openweathermap API key,
			units: "",		// your units, metric or imperial
			updateInterval: 15 * 60 * 1000, // every 15 minutes
			initialLoadDelay: 0,
			retryDelay: 2000,
			animationSpeed: 1000,
			timeFormat: 24,
			lang: "en",
			decimalSymbol: ".",
			degreeLabel: true,

			// current settings
			showWindDirection: true,
			showWindDirectionAsArrow: true,
			useBeaufort: false,
			useKMPHwind: true,
			showFeelsLike: true,
			realFeelsLike: true,		// from onecall not calculated by module
			showVisibility: true,
			showHumidity: true,
			showPressure: true,
			showDew: true,			// dew point
			showUvi: true,			// UV index
			showPrecip: true,		// precipitation
			showDescription: true,

			apiVersion: "2.5/",
			apiBase: "https://api.openweathermap.org/data/",
			weatherEndpoint: "onecall",
			endpointType: "current",

			appendLocationNameToHeader: true,
			useLocationAsHeader: false,

			calendarClass: "calendar",

			onlyTemp: false,
			hideTemp: false,
			roundTemp: false,
		}
	},

Daily forecast with onecall (7 days)

<img src=https://github.com/hangorazvan/onecall/blob/main/daily.png>

	{
		module: "onecall",
		position: "top_right",
		disabled: false,        // not necessary
		header: "Daily Weather Forecast",
		classes: "daily",
		config: {
			// you cand skip these settings if they are by default
			lat: "",	// your location latitude,
			lon: "",	// your location longitude,
			location: "",	// your location,
			appid: "",	// your openweathermap API key,
			units: "",	// your units, metric or imperial
			updateInterval: 15 * 60 * 1000, // every 15 minutes
			initialLoadDelay: 2000,
			retryDelay: 2000,
			animationSpeed: 1000,
			timeFormat: 24,
			lang: "en",
			decimalSymbol: ".",
			degreeLabel: true,

			// hourly & daily settings
			maxNumberOfDays: 8,
			showRainAmount: true, 			// snow show only in winter months
			fade: false,
			fadePoint: 0.25, 			// Start on 1/4th of the list.
			colored: true,
			extra: true,				// snow humidity, dew point, pressure, real feel and rain or snow,
			fullday: "ddd", 			// "ddd" in case of daily forecast or "HH [h]" for hourly forecast

			apiVersion: "2.5/",
			apiBase: "https://api.openweathermap.org/data/",
			weatherEndpoint: "onecall",
			endpointType: "daily",

			appendLocationNameToHeader: true,
			useLocationAsHeader: false,

			tableClass: "small",

		}
	},

Hourly forecast with onecall (1 hour)

<img src=https://github.com/hangorazvan/onecall/blob/main/hourly.png>

	{
		module: "onecall",
		position: "top_right",
		disabled: false,        // not necessary
		header: "Hourly Weather Forecast",
		classes: "hourly",
		config: {
			// you cand skip these settings if they are by default
			lat: "",	// your location latitude,
			lon: "",	// your location longitude,
			location: "",	// your location,
			appid: "",	// your openweathermap API key,
			units: "",	// your units, metric or imperial
			updateInterval: 15 * 60 * 1000, // every 15 minutes
			initialLoadDelay: 4000,
			retryDelay: 2000,
			animationSpeed: 1000,
			timeFormat: 24,
			lang: "en",
			decimalSymbol: ".",
			degreeLabel: true,

			// hourly & daily settings
			maxNumberOfDays: 4,
			showRainAmount: true, 			// snow show only in winter months
			fade: true,
			fadePoint: 0.25, 			// Start on 1/4th of the list.
			colored: true,
			extra: false,				// snow humidity, dew point, pressure, real feel and rain or snow,
			fullday: "HH [h]", 			// "ddd" in case of daily forecast or "HH [h]" for hourly forecast

			apiVersion: "2.5/",
			apiBase: "https://api.openweathermap.org/data/",
			weatherEndpoint: "onecall",
			endpointType: "hourly",

			appendLocationNameToHeader: true,
			useLocationAsHeader: false,

			tableClass: "small",
		}
	},

Redesigned by Răzvan Cristea
https://github.com/hangorazvan
Creative Commons BY-NC-SA 4.0, Romania.
