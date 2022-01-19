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

To put in your custom.css

	.compliments .wi {
		display: inline-block;
		transform: translate(20px, 25px) scale(0.6);
	}

	.compliments .wi-day-sunny {
		content: url("../modules/onecall/icons/clear.png");
		transform: translate(0, 25px);
	}

	.ompliments .wi-day-cloudy {
	  content: url("../modules/onecall/icons/mostlysunny.png");
	}

	.compliments .wi-cloudy {
	  content: url("../modules/onecall/icons/cloudy.png");
	}

	.compliments .wi-day-cloudy-windy {
	  content: url("../modules/onecall/icons/mostlycloudy.png");
	}

	.compliments .wi-day-showers {
	  content: url("../modules/onecall/icons/rain.png");
	}

	.compliments .wi-day-rain {
	  content: url("../modules/onecall/icons/rain.png");
	}

	.compliments .wi-day-thunderstorm {
	  content: url("../modules/onecall/icons/tstorms.png");
	}

	.compliments .wi-day-snow {
	  content: url("../modules/onecall/icons/snow.png");
	}

	.compliments .wi-day-fog {
	  content: url("../modules/onecall/icons/fog.png");
	}

	.compliments .wi-night-clear {
		content: url("../modules/onecall/icons/nt_clear.png");
		transform: translate(0, 25px) scale(1.2);
	}

	.compliments .wi-night-cloudy {
	  content: url("../modules/onecall/icons/nt_cloudy.png");
	}

	.compliments .wi-night-alt-cloudy {
	  content: url("../modules/onecall/icons/nt_cloudy.png");
	}

	.compliments .wi-night-alt-showers {
	  content: url("../modules/onecall/icons/nt_rain.png");
	}

	.compliments .wi-night-alt-rain {
	  content: url("../modules/onecall/icons/nt_rain.png");
	}

	.compliments .wi-night-alt-thunderstorm {
	  content: url("../modules/onecall/icons/nt_tstorms.png");
	}

	.compliments .wi-night-alt-snow {
	  content: url("../modules/onecall/icons/nt_snow.png");
	}

	.compliments .wi-night-alt-cloudy-windy {
	  content: url("../modules/onecall/icons/nt_hazy.png");
	}

	.compliments .fa,
	.compliments .fas,
	.compliments .far {
		display: inline-block;
		transform: scale(0.75);
	}

Redesigned by Răzvan Cristea
https://github.com/hangorazvan
Creative Commons BY-NC-SA 4.0, Romania.
