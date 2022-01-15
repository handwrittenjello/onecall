# onecall (Openweathermap)

https://github.com/hangorazvan/onecall

Modified MagicMirror2 deprecated current & forecast weather module based on Openweathermap with Onecall endpoint

Do not make modification and do not replace the default module, just add <i>disabled: true</i> in config.js and use this one as 3rd party

	{
		module: "weather", 
		position: "top_right",
		disabled: true,
		config: {
			// no needed anyore
		}
	},

Current weather with onecall

<img src=https://github.com/hangorazvan/onecall/blob/master/current.png>

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
			backup: "",		// second openweathermap API key,
			units: "",		// your units, metric or imperial
			dayUpdateInterval: 15 * 60 * 1000, // every 15 minutes
			nightUpdateInterval: 30 * 60 * 1000, // every 30 minutes
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

			endpointType: "current",

			appendLocationNameToHeader: true,
			useLocationAsHeader: false,

			calendarClass: "calendar",

			onlyTemp: false,
			hideTemp: false,
			roundTemp: false,	// error on true
		}
	},

Daily forecast with onecall (7 days)

<img src=https://github.com/hangorazvan/onecall/blob/master/daily.png>

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
			appid: "",		// your openweathermap API key,
			backup: "",		// second openweathermap API key,
			units: "",		// your units, metric or imperial
			dayUpdateInterval: 15 * 60 * 1000, // every 15 minutes
			nightUpdateInterval: 30 * 60 * 1000, // every 30 minutes
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

			endpointType: "daily",

			appendLocationNameToHeader: true,
			useLocationAsHeader: false,

			tableClass: "small",

		}
	},

Hourly forecast with onecall (1 hour)

<img src=https://github.com/hangorazvan/onecall/blob/master/hourly.png>

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
			appid: "",		// your openweathermap API key,
			backup: "",		// second openweathermap API key,
			units: "",		// your units, metric or imperial
			dayUpdateInterval: 15 * 60 * 1000, // every 15 minutes
			nightUpdateInterval: 30 * 60 * 1000, // every 30 minutes
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

			endpointType: "hourly",

			appendLocationNameToHeader: true,
			useLocationAsHeader: false,

			tableClass: "small",
		}
	},

Redesigned by Răzvan Cristea
https://github.com/hangorazvan
Creative Commons BY-NC-SA 4.0, Romania.
