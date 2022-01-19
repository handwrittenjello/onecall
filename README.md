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
			dayUpdateInterval: 10 * 60 * 1000, // every 10 minutes
			nightUpdateInterval: 15 * 60 * 1000, // every 15 minutes
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
			showAlerts: false,

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
			dayUpdateInterval: 10 * 60 * 1000, // every 10 minutes
			nightUpdateInterval: 15 * 60 * 1000, // every 15 minutes
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
			dayUpdateInterval: 10 * 60 * 1000, // every 10 minutes
			nightUpdateInterval: 15 * 60 * 1000, // every 15 minutes
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

Weather compliments to put in your config.js

			compliments: {			
					day_sunny : [
						"<i class=\"gold wi wi-day-sunny\"></i> Este senin",
						"<i class=\"gold wi wi-day-sunny\"></i> Vreme senină"
					],
					day_cloudy : [
						"<i class=\"lightblue wi wi-day-cloudy\"></i> Sunt câțiva nori",
						"<i class=\"lightblue wi wi-day-cloudy\"></i> Nori împrăștiați"
					],
					cloudy : [
						"<i class=\"skyblue wi wi-cloudy\"></i> Este înorat",
						"<i class=\"skyblue wi wi-cloudy\"></i> Vreme înorată"
					],
					day_cloudy_windy : [
						"<i class=\"powderblue wi wi-day-cloudy-windy\"></i> Este înorat și vânt",
						"<i class=\"powderblue wi wi-day-cloudy-windy\"></i> Este vânt și înorat"
					],
					day_showers : [
						"<i class=\"skyblue wi wi-day-showers\"></i> Ploaie ușoasă",
						"<i class=\"skyblue wi wi-day-showers\"></i> Plouă ușor"
					],
					day_rain : [
						"<i class=\"deepskyblue wi wi-day-rain\"></i> Vreme ploioasă",
						"<i class=\"deepskyblue wi wi-day-rain\"></i> Vreme cu ploaie"
					],
					day_thunderstorm : [
						"<i class=\"dodgerblue wi wi-day-thunderstorm\"></i> Este furtună!",
						"<i class=\"dodgerblue wi wi-day-thunderstorm\"></i> Atenție, furtună!"
					],
					day_snow : [
						"<i class=\"normal wi wi-day-snow\"></i> Ninsoare",
						"<i class=\"normal wi wi-day-snow\"></i> Ninge!"
					],
					day_fog : [
						"<i class=\"bright wi wi-day-fog\"></i> Vreme cu ceață",
						"<i class=\"bright wi wi-day-fog\"></i> Ceață!"
					],
					night_clear : [
						"<i class=\"dimmed wi wi-night-clear\"></i> Noapte senină",
						"<i class=\"dimmed wi wi-night-clear\"></i> Cer senin"
					],
					night_cloudy : [
						"<i class=\"powderblue wi wi-night-cloudy\"></i> Noapte înorată",
						"<i class=\"powderblue wi wi-night-cloudy\"></i> Este înorat"
					],
					night_alt_cloudy : [
						"<i class=\"powderblue wi wi-night-alt-cloudy\"></i> Noapte înorată",
						"<i class=\"powderblue wi wi-night-alt-cloudy\"></i> Este înorat"
					],
					night_alt_showers : [
						"<i class=\"skyblue wi wi-night-alt-showers\"></i> Ploaie ușoară",
						"<i class=\"skyblue wi wi-night-alt-showers\"></i> Ploaie măruntă"
					],
					night_alt_rain : [
						"<i class=\"deepskyblue wi wi-night-alt-rain\"></i> Noapte ploioasă",
						"<i class=\"deepskyblue wi wi-night-alt-rain\"></i> Plouă!"
					],
					night_alt_thunderstorm : [
						"<i class=\"royalblue wi wi-night-alt-thunderstorm\"></i> Noapte furtunoasă!",
						"<i class=\"royalblue wi wi-night-alt-thunderstorm\"></i> Furtuna!"
					],
					night_alt_snow : [
						"<i class=\"normal wi wi-night-alt-snow\"></i> Noapte cu ninsoare",
						"<i class=\"normal wi wi-night-alt-snow\"></i> Ninge!"
					],
					night_alt_cloudy_windy : [
						"<i class=\"skyblue wi wi-night-alt-cloudy-windy\"></i> Nori și ceață",
						"<i class=\"skyblue wi wi-night-alt-cloudy-windy\"></i> Ceață și nori"
					],
			}

Redesigned by Răzvan Cristea
https://github.com/hangorazvan
Creative Commons BY-NC-SA 4.0, Romania.
