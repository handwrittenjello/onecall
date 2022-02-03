# onecall (Openweathermap)

https://github.com/hangorazvan/onecall

Modified MagicMirror2 original current & forecast weather module based on Openweathermap with Onecall endpoint and Air Quality Index with compliments. 

As the name suggests this module call only once your appid no matter how many instances are loaded, for current, hourly, daily or AQI, it uses the onecall endpoint for which reason it was designed for. 

However the module can work without oneLoader and in this case it must be deactivated via <i>oneLoader: false</i> and configure latitude, longitude and appid for each instance used.

Keep in mind that this module is for my personal use with specific css styling or settings and not necessarily for sharing so don't create issues or pull requests.

Do not make modification and do not replace the default module, just add <i>disabled: true</i> in config.js and use this one as 3rd party.

	{
		module: "weather", 
		position: "top_right",
		disabled: true,
		config: {
								// no needed anyore
		}
	},

#### Onecall API loader

		{
			module: "onecall/loader",
			config: {
				lat: "",                               // your location latitude,
				lon: "",                               // your location longitude,
				appid: "",                             // your Openweathermap appid
				appid2: "",                            // optional
				backup: "",                            // optional backup appid
				dayUpdateInterval: 10 * 60 * 1000,     // every 10 minutes
				nightUpdateInterval: 15 * 60 * 1000,   // every 15 minutes
			}
		},

#### Current weather with onecall

<img src=https://github.com/hangorazvan/onecall/blob/master/current.png>

	{
		module: "onecall",
		position: "top_right",
		header: "Current Weather",
		classes: "current weather",
		config: {

			// current settings
			showWindDirection: true,
			showWindDirectionAsArrow: false,	// not realy working
			useBeaufort: false,
			useKMPHwind: true,
			showFeelsLike: true,
			realFeelsLike: true,        // from onecall endpoint not calculated by module
			showVisibility: true,
			showHumidity: true,
			showPressure: true,
			showDew: true,              // dew point
			showUvi: true,              // UV index
			showDescription: true,
			showAlerts: false,

			showRainAmount: true,       // snow show only in winter months

			endpointType: "current",    // "current", "hourly", "daily" or "aqi"
			oneLoader: true,            // very important for just one API call
		}
	},

#### Daily forecast with onecall (7 days)

<img src=https://github.com/hangorazvan/onecall/blob/master/daily.png>

	{
		module: "onecall",
		position: "top_right",
		disabled: false,                // not necessary
		header: "Daily Weather Forecast",
		classes: "daily",
		config: {

			// hourly & daily settings
			flexDayForecast: false,     // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfDays: 8,
			fade: false,
			fadePoint: 0.25,            // Start on 1/4th of the list.
			colored: true,
			extra: true,                // snow humidity, dew point, pressure, real feel and rain or snow,
			fullday: "ddd",             // "ddd" in case of daily forecast or "HH [h]" for hourly forecast
			                            // "dddd" for full day name

			endpointType: "daily",      // "current", "hourly", "daily" or "aqi"
			oneLoader: true,            // important for just one API call
		}
	},

#### Hourly forecast with onecall (1 hour)

<img src=https://github.com/hangorazvan/onecall/blob/master/hourly.png>

	{
		module: "onecall",
		position: "top_right",
		header: "Hourly Weather Forecast",
		classes: "hourly",
		config: {

			// hourly & daily settings
			flexDayForecast: false,       // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfDays: 4,
			fade: true,
			fadePoint: 0.25,              // Start on 1/4th of the list.
			colored: true,
			extra: true,                  // snow humidity, dew point, pressure, real feel and rain or snow,
			fullday: "HH [h]",            // "ddd" in case of daily forecast or "HH [h]" for hourly forecast
			                              // "dddd" for full day name

			endpointType: "hourly",       // "current", "hourly", "daily" or "aqi"
			oneLoader: true,              // very important for just one API call
		}
	},

#### Flex Day Forecast (3 hours and 6 days)

<img src=https://github.com/hangorazvan/onecall/blob/master/flex.png>

	{
		module: "onecall",
		position: "top_right",
		header: "Hourly Weather Forecast",
		classes: "hourly",
		config: {

			flexDayForecast: true,          // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfDays: 3,
			fullday: "HH.mm",

			endpointType: "hourly",         // "current", "hourly", "daily" or "aqi"
			oneLoader: true,                // very important for just one API call
		}
	},


	{
		module: "onecall",
		position: "top_right",
		header: "Daily Weather Forecast",
		classes: "daily",
		config: {

			flexDayForecast: true,         // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
			maxNumberOfDays: 6,
			fullday: "dddd",               // "dddd" for full day name
			extra: true,

			endpointType: "daily",         // "current", "hourly", "daily" or "aqi"
			oneLoader: true,               // very important for just one API call
		}
	},

#### With or without Flex Day Forecast and with default icons

<img src=https://github.com/hangorazvan/onecall/blob/master/onecall_flex.png height="800"> <img src=https://github.com/hangorazvan/onecall/blob/master/onecall.png height="800"> <img src=https://github.com/hangorazvan/onecall/blob/master/defaultIcons.png height="800">


#### Air Quality Index also in stand alone module https://github.com/hangorazvan/pollution

<img src=https://github.com/hangorazvan/pollution/blob/master/aqi.png>

	{
		module: "onecall",
		position: "top_right",
		header: "Air Quality Index",
		classes: "air quality day",
		disabled: false,
		config: {
			endpointType: "aqi",         // "current", "hourly", "daily" or "aqi"
			oneLoader: true,             // very important for just one API call

			calculateAqi: true,          // calculate AQI from pollutants concentration
			showAqiTime: true,           // show last update time
			showAqiData: true,           // show AQI calculation pollutants, hidding last update
			showPollution: false,        // snow list of all pollutants, hidding AQI calculation
		}
	},

	/*
	Quality   Index     Sub-index   CAQI calculation from highest pollutant concentration in μg/m3

	                                O3          NO2         PM10        PM25         SO2         NH3        CO

	Good        1       0-25        0-60        0-50        0-25        0-15         0-50        0-200      0-5000
	Fair        2       25-50       60-120      50-100      25-50       15-30        50-100      200-400    5000-7500
	Moderate    3       50-75       120-180     100-200     50-90       30-55        100-350     400-800    7500-10000
	Poor        4       75-100      180-240     200-400     90-180      55-110       350-500     800-1600   10000-20000
	Unhealty    5       > 100       > 240       > 400       > 180       > 110        > 500       > 1600     > 20000

	Source: https://www.airqualitynow.eu/download/CITEAIR-Comparing_Urban_Air_Quality_across_Borders.pdf
	*/

Weather and Air Quality compliments to put in your config.js
<br>You need to use my compliments_plus to work with AQI compliments
https://github.com/hangorazvan/compliments_plus

	compliments: {
		AQI_1 : [
			 "<i class=\"fa fa-leaf lime\"></i> Air Quality Good",
		],
		AQI_2 : [
			 "<i class=\"fa fa-leaf yellow\"></i> Air Quality Fair",
			],
		AQI_3 : [
			 "<i class=\"fa fa-leaf orange\"></i> Air Quality Moderate",
		],
		AQI_4 : [
			 "<i class=\"fa fa-leaf orangered\"></i> Air Quality Poor",
		],
		AQI_5 : [
			 "<i class=\"fa fa-leaf redrf\"></i> Air Quality Unhealty",
		],			
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
