/* Magic Mirror
 * Module: Onecall OpenWeatherMap
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * Redesigned by Răzvan Cristea
 * https://github.com/hangorazvan
 */
Module.register("onecall", {
	// Default module config.
	defaults: {
		lat: config.latitude,
		lon: config.longitude,
		location: config.location,
		appid: "",
		backup: config.backup,
		units: config.units,
		dayUpdateInterval: 10 * 60 * 1000, // every 10 minutes
		nightUpdateInterval: 15 * 60 * 1000, // every 15 minutes
		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: config.delay,
		animationSpeed: config.animation,
		timeFormat: config.timeFormat,
		language: config.language,
		decimalSymbol: config.decimal,
		degreeLabel: config.scale,

		// current settings
		showWindDirection: true,
		showWindDirectionAsArrow: true,
		useBeaufort: false,
		useKMPHwind: true,
		showFeelsLike: true,
		realFeelsLike: true,
		showVisibility: true,
		showHumidity: true,
		showPressure: true,
		showDew: true,
		showUvi: true,
		showPrecip: true,
		showDescription: true,
		showAlerts: false,

		// hourly & daily settings
		maxNumberOfDays: 8,
		showRainAmount: true,
		fade: false,
		fadePoint: 0.25, // Start on 1/4th of the list.
		colored: true,
		extra: false,
		fullday: "ddd",

		endpointType: "current",
		
		// Air Quality settings for endpointType: "aqi"
		calculateAqi: true,
		showAqiTime: true,
		showAqiData: true,
		showPollution: false,

		appendLocationNameToHeader: true,
		useLocationAsHeader: false,

		calendarClass: "calendar",
		tableClass: "small",

		onlyTemp: false,
		hideTemp: false,
		roundTemp: config.roundTemp,

		iconTable: {
			"01d": "day-sunny",
			"02d": "day-cloudy",
			"03d": "cloudy",
			"04d": "day-cloudy-windy",
			"09d": "day-showers",
			"10d": "day-rain",
			"11d": "day-thunderstorm",
			"13d": "day-snow",
			"50d": "day-fog",
			"01n": "night-clear",
			"02n": "night-alt-cloudy",
			"03n": "night-cloudy",
			"04n": "night-alt-cloudy",
			"09n": "night-alt-showers",
			"10n": "night-alt-rain",
			"11n": "night-alt-thunderstorm",
			"13n": "night-alt-snow",
			"50n": "night-alt-cloudy-windy"
		}
	},

	// create a variable for the first upcoming calendar event. Used if no location is specified.
	firstEvent: true,

	// create a variable to hold the location name based on the API result.
	fetchedLocationName: this.config.location,

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function () {
		return ["onecall.css", "font-awesome.css", "weather-icons.css"];
	},

	// Define required translations.
	getTranslations: function () {
		return false;
	},

	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(this.config.language);

		this.windSpeed = null;
		this.windDirection = null;
		this.windDeg = null;
		this.temperature = null;
		this.weatherType = null;
		this.feelsLike = null;
		this.dew = null;				// dew point.
		this.uvi = null;				// uv index.
		this.desc = null;	 			// weather description.
		this.rain = null;	 			// current rain.
		this.snow = null;	 			// current snow.
		this.pressure = null;	 		// main pressure.
		this.visibility = null;	 		// visibility.
		this.start = null;
		this.end = null;
		this.alert = null;

		this.aqi = null;	 			// Air Quality
		this.aqi_t = null;
		this.c_co = null;
		this.c_no = null;
		this.c_no2 = null;
		this.c_o3 = null;
		this.c_so2 = null;
		this.c_pm25 = null;
		this.c_pm10 = null;
		this.c_nh3 = null;

		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.forecast = [];
		this.updateTimer = null;
	},

	// add extra information of current weather
	// windDirection, pressure, visibility and humidity
	addExtraInfoWeather: function (wrapper) {
		var small = document.createElement("div");
		small.className = "normal medium";

		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind cyan";
		small.appendChild(windIcon);

		if (this.config.showWindDirection) {
			var windDirection = document.createElement("span");
			windDirection.className = "wind";
			if (this.config.showWindDirectionAsArrow) {
				if (this.windDeg !== null) {
					windDirection.innerHTML = " <i class=\"wi wi-direction-down\" style=\"transform:rotate(" + this.windDeg + "deg);\"></i>";
				}
			} else {
				windDirection.innerHTML = this.translate(this.windDirection);
			}
			small.appendChild(windDirection);
		}

		var windSpeed = document.createElement("span");
		if (this.windSpeed > 50 && this.windSpeed < 75) {
			windSpeed.className = "lightblue";
		} else if (this.windSpeed > 75 && this.windSpeed < 100) {
			windSpeed.className = "yellow";
		} else if (this.windSpeed > 100) {
			windSpeed.className = "coral";
		} else windSpeed.className = " ";
		windSpeed.innerHTML = " " + this.windSpeed;
		small.appendChild(windSpeed);

		var windSpeedUnit = document.createElement("span");
		windSpeedUnit.className = "subs";
		windSpeedUnit.innerHTML = " km/h ";
		small.appendChild(windSpeedUnit);

		// pressure.
		if (this.config.showPressure) {
			var pressure = document.createElement("span");
			var atpressure = Math.round(this.pressure * 750.062 / 1000);
				if (atpressure < 745) {
					pressure.className = "pressure lightblue";
				} else if (atpressure > 775) {
					pressure.className = "pressure orange";
				} else pressure.className = "pressure greenyellow";
			pressure.innerHTML = " <i class=\"wi wi-barometer gold\"></i> " + Math.round(this.pressure * 750.062 / 1000);
			small.appendChild(pressure);

			var pressureSub = document.createElement("span");
			pressureSub.className = "subs";
			pressureSub.innerHTML = " Hg ";
			small.appendChild(pressureSub);
		}

		// visibility.
		if (this.config.showVisibility) {
			var visibility = document.createElement("span");
			visibility.className = "visibility";
			visibility.innerHTML = " <i class=\"fa fa-binoculars violet\"></i> " + this.visibility / 1000;
			small.appendChild(visibility);

			var visibilityUnit = document.createElement("span");
			visibilityUnit.className = "subs";
			visibilityUnit.innerHTML = " km ";
			small.appendChild(visibilityUnit);
		}

		// humidity.
		if (this.config.showHumidity) {
			var humidity = document.createElement("span");
			if (this.humidity < 30) {
				humidity.className = "lightblue";
			} else if (this.humidity > 50 && this.humidity < 80) {
				humidity.className = "yellow";
			} else if (this.humidity > 80) {
				humidity.className = "coral";
			} else humidity.className = " ";
			humidity.innerHTML = " <i class=\"wi wi-humidity skyblue\"></i> " + this.humidity + "%";
			small.appendChild(humidity);
		}

		wrapper.appendChild(small);
	},

	// Override dom generator.
	getDom: function () {
		if (this.config.appid === "" || this.config.backup === "") {
			var wrapper = document.createElement("div");
			wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
			
		if (!this.loaded) {
			var wrapper = document.createElement("div");
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		
		if (!this.config.colored) {
		    var onegray = Array.from(document.querySelectorAll(".onecall"));
		    onegray.forEach(function(element) {return element.style.filter = "grayscale(1)";});
		}

		if (this.config.endpointType === "current") {
			var wrapper = document.createElement("div");
			wrapper.className = "currentweather";

			if (this.config.onlyTemp === false) {
				this.addExtraInfoWeather(wrapper);
			}

			var large = document.createElement("div");
			large.className = "light";

			var degreeLabel = "";
			if (this.config.units === "metric" || this.config.units === "imperial") {
				degreeLabel;
			}
			if (this.config.degreeLabel) {
				switch (this.config.units) {
					case "metric":
						degreeLabel += "C";
						break;
					case "imperial":
						degreeLabel += "F";
						break;
					case "default":
						degreeLabel += "K";
						break;
				}
			}

			if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
				this.config.decimalSymbol = ".";
			}

			if (this.config.hideTemp === false) {
				var weatherIcon = document.createElement("span");
				weatherIcon.className = "wi weathericon wi-" + this.weatherType;
				large.appendChild(weatherIcon);

				var temperature = document.createElement("span");
				temperature.className = "bright light xlarge";
				temperature.innerHTML = " " + this.temperature.replace(".", this.config.decimalSymbol) + "&deg;<span class=\"deg\">" + degreeLabel + "</span>";
				large.appendChild(temperature);
			}

			wrapper.appendChild(large);

			if (this.config.onlyTemp === false) {
				var small = document.createElement("div");
				small.className = "normal medium";

				// only for metric.
				if (this.config.showFeelsLike) {
					var feelsLike = document.createElement("div");
					if (this.config.units == "metric") {
						if (this.feelsLike == -0) {this.feelsLike = 0}
						if (this.feelsLike >= 45) {
							feelsLike.className = "real redrf";
						} else if (this.feelsLike >= 40 && this.feelsLike < 45) {
							feelsLike.className = "real orangered";
						} else if (this.feelsLike >= 35 && this.feelsLike < 40) {
							feelsLike.className = "real tomato";
						} else if (this.feelsLike >= 30 && this.feelsLike < 35) {
							feelsLike.className = "real coral";
						} else if (this.feelsLike >= 25 && this.feelsLike < 30) {
							feelsLike.className = "real darkorange";
						} else if (this.feelsLike >= 20 && this.feelsLike < 25) {
							feelsLike.className = "real gold";
						} else if (this.feelsLike >= 15 && this.feelsLike < 20) {
							feelsLike.className = "real yellow";
						} else if (this.feelsLike >= 10 && this.feelsLike < 15) {
							feelsLike.className = "real greenyellow";
						} else if (this.feelsLike >= 5 && this.feelsLike < 10) {
							feelsLike.className = "real chartreuse";
						} else if (this.feelsLike >= 0 && this.feelsLike < 5) {
							feelsLike.className = "real lawngreen";
						} else if (this.feelsLike >= -5 && this.feelsLike < 0) {
							feelsLike.className = "real lime";
						} else if (this.feelsLike >= -10 && this.feelsLike < -5) {
							feelsLike.className = "real powderblue";
						} else if (this.feelsLike >= -15 && this.feelsLike < -10) {
							feelsLike.className = "real lightblue";
						} else if (this.feelsLike >= -20 && this.feelsLike < -15) {
							feelsLike.className = "real skyblue";
						} else if (this.feelsLike >= -25 && this.feelsLike < -20) {
							feelsLike.className = "real lightskyblue";
						} else if (this.feelsLike >= -30 && this.feelsLike < -25) {
							feelsLike.className = "real deepskyblue";
						} else if (this.feelsLike < 30) {
							feelsLike.className = "real dodgerblue";
						}
					} else feelsLike.className = "dimmed real";

					feelsLike.innerHTML = this.translate("FEELS", {DEGREE: "<i class=\"wi wi-thermometer yellow\"></i> " + this.feelsLike + "&deg;" + degreeLabel});
					small.appendChild(feelsLike);
				}

				// dew point.
				if (this.config.showDew) {
					var dew = document.createElement("span"); 
					dew.className = "dew midget cyan";
					dew.innerHTML = this.translate("DEW") + "<i class=\"wi wi-raindrops lightgreen\"></i> " + this.dew.toFixed(1) + "&deg;" + degreeLabel;
					small.appendChild(dew);
				}

				var spacer = document.createElement("span");
				spacer.innerHTML = "&nbsp; ";
				small.appendChild(spacer);

				// uv index.
				if (this.config.showUvi) {
					var uvi = document.createElement("span");
					uvi.className = "uvi midget";
					uvi.innerHTML = this.translate("UVI") + "<i class=\"wi wi-hot gold\"></i>" + this.uvi.toFixed(1);
					if (this.uvi < 0.1) {
						uvi.className = uvi.className + " lightgreen";
						uvi.innerHTML = this.translate("UVI") + "<i class=\"wi wi-stars\"></i> 0";
					} else if (this.uvi > 0 && this.uvi < 3) {
						uvi.className = uvi.className + " lime";
					} else if (this.uvi >= 3 && this.uvi < 6) {
						uvi.className = uvi.className + " yellow";
					} else if (this.uvi >= 6 && this.uvi < 8) {
						uvi.className = uvi.className + " orange";
					} else if (this.uvi >= 8 && this.uvi < 11) {
						uvi.className = uvi.className + " orangered";
					} else if (this.uvi >= 11) {
						uvi.className = uvi.className + " violet";
					}
					small.appendChild(uvi);
				}

				// precipitation
				if (this.config.showPrecip) {
					var precipitation = document.createElement("div");
					precipitation.className = "prep midget";
					if (this.precipitation > 0) {
						if(config.units === "imperial") {
							precipitation.innerHTML = this.translate("PRECIP") + " " + (this.precipitation / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
						} else {
							precipitation.innerHTML = this.translate("PRECIP") + " " + this.precipitation.toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
						}
					} else {
						precipitation.innerHTML = this.translate("No prep") + " <i class=\"fa fa-tint-slash skyblue\"></i>";
					}
					small.appendChild(precipitation);
				}

				// weather description.
				if (this.config.showDescription) {
					var description = document.createElement("div");
					description.className = "bright";
					description.innerHTML = this.desc;
					small.appendChild(description);
				}

				if (this.config.showAlerts && (this.alert !== null)) {
					var alerts = document.createElement("div");
					alerts.className = "midget coral alerts";
					alerts.innerHTML = "<i class=\"wi wi-small-craft-advisory\"></i> " + this.translate("ALERTS") + this.start + " - " + this.end + "<br>" + this.alert;
					small.appendChild(alerts);
				}

				wrapper.appendChild(small);
			}

			return wrapper;

		} else if (this.config.endpointType === "aqi") {
			var wrapper = document.createElement("div");
			wrapper.className = "airpollution";

			/*
			Quality   Index     Sub-index   CAQI calculation from highest pollutant concentration in μg/m3

			                                O3          NO2         PM10        PM25         SO2         NH3        CO

			Good        1       0-25        0-60        0-50        0-25        0-15         0-50        0-200      0-5000
			Fair        2       25-50       60-120      50-100      25-50       15-30        50-100      200-400    5000-7500
			Moderate    3       50-75       120-180     100-200     50-90       30-55        100-350     400-800    7500-10000
			Poor        4       75-100      180-240     200-400     90-180      55-110       350-500     800-1600   10000-20000
			Very Poor   5       > 100       > 240       > 400       > 180       > 110        > 500       > 1600     > 20000

			Source: https://www.airqualitynow.eu/download/CITEAIR-Comparing_Urban_Air_Quality_across_Borders.pdf
			*/

			var aqi = document.createElement("div");
			aqi.className = "normal medium aqi bright";
			var aqi_q = null; var aqi_c = null;
			if (this.config.calculateAqi) {
				var aqi_i = null;
				aqi_i = Math.max(
					this.c_no2/4,       // mandatory
					this.c_no/4,        // optional
					this.c_pm10/1.8,    // mandatory 
					this.c_o3/2.4,      // mandatory
					this.c_pm25/1.1,    // optional
					this.c_so2/5,       // optional
					this.c_nh3/16,      // optional
					this.c_co/200       // optional
				).toFixed(0);
				if (aqi_i <= 25 
					|| this.c_no2 <= 50 
					|| this.c_no <= 50 
					|| this.c_pm10 <= 25 
					|| this.c_o3 <= 60 
					|| this.c_pm25 <= 15 
					|| this.c_co <= 5000 
					|| this.c_so2 <= 50 
					|| this.c_nh3 <= 200) {
					aqi_q = this.translate("Good");
					aqi_c = "lime";
				} else if (aqi_i > 25 
					|| this.c_no2 > 50 
					|| this.c_no > 50 
					|| this.c_pm10 > 25 
					|| this.c_o3 > 60 
					|| this.c_pm25 > 15	
					|| this.c_co > 5000	
					|| this.c_so2 > 50 
					|| this.c_nh3 > 200) {
					aqi_q = this.translate("Fair");
					aqi_c = "yellow";
				} else if (aqi_i > 50 
					|| this.c_no2 > 100 
					|| this.c_no > 100 
					|| this.c_pm10 > 50 
					|| this.c_o3 > 120 
					|| this.c_pm25 > 30 
					|| this.c_co > 7500 
					|| this.c_so2 > 100 
					|| this.c_nh3 > 400) {
					aqi_q = this.translate("Moderate");
					aqi_c = "orange";
				} else if (aqi_i > 75 
					|| this.c_no2 > 200 
					|| this.c_no > 200 
					|| this.c_pm10 > 90 
					|| this.c_o3 > 180 
					|| this.c_pm25 > 55 
					|| this.c_co > 10000 
					|| this.c_so2 > 350 
					|| this.c_nh3 > 800) {
					aqi_q = this.translate("Poor");
					aqi_c = "orangered";
				} else if (aqi_i > 100 
					|| this.c_no2 > 400 
					|| this.c_no > 400 
					|| this.c_pm10 > 180 
					|| this.c_o3 > 240 
					|| this.c_pm25 > 110 
					|| this.c_co > 20000 
					|| this.c_so2 > 500 
					|| this.c_nh3 > 1600) {
					aqi_q = this.translate("Unhealty");
					aqi_c = "redrf";
				}
				aqi.innerHTML = this.translate("Index") + " <i class=\"fa fa-leaf " + aqi_c + "\"></i> <span class=" + aqi_c + ">" + aqi_q + " (" + aqi_i + ")</span>";
			} else {
				if (this.aqi == 1) { 
					aqi_q = this.translate("Good");
					aqi_c = "lime";
				} else if (this.aqi == 2) { 
					aqi_q = this.translate("Fair");
					aqi_c = "yellow";
				} else if (this.aqi == 3) { 
					aqi_q = this.translate("Moderate");
					aqi_c = "orange";
				} else if (this.aqi == 4) { 
					aqi_q = this.translate("Poor");
					aqi_c = "orangered";
				} else if (this.aqi == 5) { 
					aqi_q = this.translate("Unhealty");
					aqi_c = "redrf";
				}
				aqi.innerHTML = this.translate("Index") + " <i class=\"fa fa-leaf " + aqi_c + "\"></i> <span class=" + aqi_c + ">" + aqi_q + " (" + this.aqi + ")</span>";
			}
			wrapper.appendChild(aqi);

			if (this.config.showAqiData && !this.config.showPollution) {
		 		var aqi_d = document.createElement("div");
				aqi_d.className = "normal small aqi_d";
				if (this.config.calculateAqi) {
    				aqi_d.innerHTML = "O<sub>3</sub> <span class=bright>" + (this.c_o3/2.4).toFixed(0)
    					+ "</span>; PM<sub>10</sub> <span class=bright>" + (this.c_pm10/1.8).toFixed(0)
    					+ "</span>; PM<sub>2.5</sub> <span class=bright>" + (this.c_pm25/1.1).toFixed(0)
    					+ "</span>; NO<sub>2</sub> <span class=bright>" + (this.c_no2/4).toFixed(0)
    					+ "</span>; SO<sub>2</sub> <span class=bright>" + (this.c_so2/5).toFixed(0)
    					+ "</span>";
				} else {
    				aqi_d.innerHTML = "O<sub>3</sub> <span class=bright>" + this.c_o3.toFixed(0).replace(".", this.config.decimalSymbol)
    					+ "</span>; PM<sub>10</sub> <span class=bright>" + this.c_pm10.toFixed(0).replace(".", this.config.decimalSymbol)
    					+ "</span>; PM<sub>2.5</sub> <span class=bright>" + this.c_pm25.toFixed(0).replace(".", this.config.decimalSymbol)
    					+ "</span>; NO<sub>2</sub> <span class=bright>" + this.c_no2.toFixed(0).replace(".", this.config.decimalSymbol)
    					+ "</span>; SO<sub>2</sub> <span class=bright>" + this.c_so2.toFixed(0).replace(".", this.config.decimalSymbol)
    					+ "</span>";
				}
				wrapper.appendChild(aqi_d);
			} else if (this.config.showAqiTime) {
		 		var aqi_t = document.createElement("div");
				aqi_t.className = "shade small aqi_t";
				aqi_t.innerHTML = this.translate("Update") + this.aqi_t + ", " + this.config.location;
				wrapper.appendChild(aqi_t);
			}
			
			if (this.config.showPollution) {
				this.config.showAqiData = false;
				var spacer = document.createElement("br");
				wrapper.appendChild(spacer);

				var c_o3 = document.createElement("div");
				c_o3.className = "normal small c_o3";
				c_o3.innerHTML = "Ozone (O<sub>3</sub>) <span class=bright>" + this.c_o3.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
				wrapper.appendChild(c_o3);

				var c_pm10 = document.createElement("div");
				c_pm10.className = "normal small c_pm10";
				c_pm10.innerHTML = "10μm particle (PM<sub>10</sub>) <span class=bright>" + this.c_pm10.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
				wrapper.appendChild(c_pm10);

				var c_pm25 = document.createElement("div");
				c_pm25.className = "normal small c_pm25";
				c_pm25.innerHTML = "2.5μm particle (PM<sub>2.5</sub>) <span class=bright>" + this.c_pm25.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
				wrapper.appendChild(c_pm25);

				var c_no2 = document.createElement("div");
				c_no2.className = "normal small c_no2";
				c_no2.innerHTML = "Nitrogen dioxide (NO<sub>2</sub>) <span class=bright>" + this.c_no2.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
				wrapper.appendChild(c_no2);

				var c_no = document.createElement("div");
				c_no.className = "normal small c_no";
				c_no.innerHTML = "Nitrogen monoxide (NO) <span class=bright>" + this.c_no.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
				wrapper.appendChild(c_no);

				var c_so2 = document.createElement("div");
				c_so2.className = "normal small c_so2";
				c_so2.innerHTML = "Sulphur dioxide (SO<sub>2</sub>) <span class=bright>" + this.c_so2.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
				wrapper.appendChild(c_so2);

				var c_co = document.createElement("div");
				c_co.className = "normal small c_co";
				c_co.innerHTML = "Carbon monoxide (CO) <span class=bright>" + this.c_co.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
				wrapper.appendChild(c_co);

				var c_nh3 = document.createElement("div");
				c_nh3.className = "normal small c_nh3";
				c_nh3.innerHTML = "Ammonia (NH<sub>3</sub>) <span class=bright>" + this.c_nh3.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
				wrapper.appendChild(c_nh3);
			}

			return wrapper;

		} else {

			var table = document.createElement("table");
			table.className = "weatherforecast " + this.config.tableClass;

			for (var f in this.forecast) {
				var forecast = this.forecast[f];

				var row = document.createElement("tr");
				row.className = "forecast";
				table.appendChild(row);

				var dayCell = document.createElement("td");

				if (this.config.language == "ro") {
					dayCell.className = "align-left day ro";
				} else dayCell.className = "align-left day en";

				dayCell.innerHTML = forecast.day;
				row.appendChild(dayCell);

				var iconCell = document.createElement("td");
				iconCell.className = "align-center bright weather-icon";
				row.appendChild(iconCell);

				var icon = document.createElement("span");
				icon.className = "align-center wi forecasticon wi-" + forecast.icon;
				iconCell.appendChild(icon);

				var degreeLabel = "";
				if (this.config.units === "metric" || this.config.units === "imperial") {
					degreeLabel += "&deg;";
				}
				if (this.config.degreeLabel) {
					switch (this.config.units) {
						case "metric":
							degreeLabel += "C";
							break;
						case "imperial":
							degreeLabel += "F";
							break;
						case "default":
							degreeLabel = "K";
							break;
					}
				}

				if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
					this.config.decimalSymbol = ".";
				}

				if (this.config.endpointType === "hourly") {
					var medTempCell = document.createElement("td");
					medTempCell.innerHTML = forecast.dayTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					medTempCell.className = "align-center lime";
					row.appendChild(medTempCell);

					var realFeel = document.createElement("td");
					realFeel.innerHTML = parseFloat(forecast.realFeels).toFixed(0).replace(".", this.config.decimalSymbol) + degreeLabel;
					realFeel.className = "align-center yellow";
					row.appendChild(realFeel);	
				} else {
					var maxTempCell = document.createElement("td");
					maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					maxTempCell.className = "align-center max-temp coral";
					row.appendChild(maxTempCell);

					var minTempCell = document.createElement("td");
					minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					minTempCell.className = "align-center min-temp skyblue";
					row.appendChild(minTempCell);
				}

				if (this.config.showRainAmount) {
					var rainCell = document.createElement("td");
					rainCell.className = "align-right bright";
					if (!forecast.snow && !forecast.rain) {
						rainCell.className = "align-right rain";
						rainCell.innerHTML = this.translate("No rain") + " <i class=\"fa fa-tint-slash skyblue\"></i>";
					} else if (forecast.snow) {
						if (config.units !== "imperial") {
							rainCell.innerHTML = parseFloat(forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-snowflake-cold lightblue\"></i>";
						} else {
							rainCell.innerHTML = (parseFloat(forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-snowflake-cold lightblue\"></i>";
						}
					} else if (forecast.rain) {
						if (config.units !== "imperial") {
							rainCell.innerHTML = parseFloat(forecast.rain).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
						} else {
							rainCell.innerHTML = (parseFloat(forecast.rain) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
						}
					} else if (forecast.rain && forecast.snow) {
						if (config.units !== "imperial") {
							rainCell.innerHTML = parseFloat(forecast.rain + forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
						} else {
							rainCell.innerHTML = (parseFloat(forecast.rain + forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
						}
					} 
					row.appendChild(rainCell);
				}

				if (this.config.fade && this.config.fadePoint < 1) {
					if (this.config.fadePoint < 0) {
						this.config.fadePoint = 0;
					}
					var startingPoint = this.forecast.length * this.config.fadePoint;
					var steps = this.forecast.length - startingPoint;
					if (f >= startingPoint) {
						var currentStep = f - startingPoint;
						row.style.opacity = 1 - (1 / steps) * currentStep;
					}
				}

				// add extra information of weather forecast
				// humidity, dew point,, pressure, visibility, feels like and UV index
				if (this.config.extra) {
					var row = document.createElement("tr");
					row.className = "extra";
					table.appendChild(row);

					var humidity = document.createElement("td");
					humidity.innerHTML = "<i class=\"wi wi-humidity skyblue little\"></i> " + parseFloat(forecast.humidity).toFixed(0) + "%";
					humidity.className = "align-left humidity";
					row.appendChild(humidity);

					var dewPoint = document.createElement("td");
					dewPoint.innerHTML = parseFloat(forecast.dewPoint).toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
					dewPoint.className = "align-center dewPoint cyan";
					row.appendChild(dewPoint);

					var pressure = document.createElement("td");
					pressure.innerHTML = Math.round(forecast.pressure * 750.062 / 1000).toFixed(0) + " Hg";
					pressure.className = "align-center pressure gold";
					row.appendChild(pressure);

					if (this.config.endpointType === "hourly") {
						var visible = document.createElement("td");
						visible.innerHTML =  forecast.visibility/1000 + " Km";
						visible.className = "align-center violet visibility";
						row.appendChild(visible);
					} else {
						var realFeelDay = document.createElement("td");
						realFeelDay.innerHTML =  parseFloat(forecast.realFeelsDay).toFixed(0) + degreeLabel;
						realFeelDay.className = "align-center realFeel yellow";
						row.appendChild(realFeelDay);
					}
					
					var uvIndex = document.createElement("td");
					uvIndex.innerHTML = "UVI " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
					uvIndex.className = "align-right uvIndex lightgreen";
					row.appendChild(uvIndex);
				}

				if (this.config.fade && this.config.fadePoint < 1) {
					if (this.config.fadePoint < 0) {
						this.config.fadePoint = 0;
					}
					var startingPoint = this.forecast.length * this.config.fadePoint;
					var steps = this.forecast.length - startingPoint;
					if (f >= startingPoint) {
						var currentStep = f - startingPoint;
						row.style.opacity = 1 - (1 / steps) * currentStep;
					}
				}
			}

			return table;
		}
	},

	// Override getHeader method.
	getHeader: function () {
		if (this.config.useLocationAsHeader && this.config.location !== false) {
			return this.config.location;
		}

		if (this.config.appendLocationNameToHeader) {
			if (this.data.header) return this.data.header + " " + this.fetchedLocationName;
			else return this.fetchedLocationName;
		}

		return this.data.header ? this.data.header : "";
	},

	// Override notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			if (this.config.appendLocationNameToHeader) {
				this.hide(0, { lockString: this.identifier });
			}
		}
		if (notification === "CALENDAR_EVENTS") {
			var senderClasses = sender.data.classes.toLowerCase().split(" ");
			if (senderClasses.indexOf(this.config.calendarClass.toLowerCase()) !== -1) {
				this.firstEvent = false;

				for (var e in payload) {
					var event = payload[e];
					if (event.location || event.geo) {
						this.firstEvent = event;
					//	Log.log("First upcoming event with location: ", event);
						break;
					}
				}
			}
		}
	},

	/* updateWeather(compliments)
	 * Requests new data from openweather.org.
	 * Calls processWeather on succesfull response.
	 */
	updateWeather: function () {
		if (this.config.appid === "" || this.config.backup === "") {
			Log.error("OneCall: APPID not set!");
			return;
		}

		var url = "https://api.openweathermap.org/data/2.5/onecall" + this.getParams();
		var self = this;
		var retry = true;

		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
					self.processForecast(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					self.config.appid = self.config.backup;
			/*	if (self.config.endpointType === "daily") {
						self.config.endpointType = "hourly";
						Log.warn(self.name + ": Incorrect APPID.");
					}
			*/		retry = true;
				} else {
					Log.error(self.name + ": Incorrect APPID. Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},
	
	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	getParams: function () {
		var params = "?";
		if (this.config.lat && this.config.lon) {
			params += "lat=" + this.config.lat + "&lon=" + this.config.lon;
		} else if (this.firstEvent && this.firstEvent.geo) {
			params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.geo.lon;
		} else {
			this.hide(this.config.animationSpeed, { lockString: this.identifier });
			Log.error(this.name + ": Latitude and longitude not set!");
			return;
		}

		var numberOfDays;
		if (this.config.endpointType === "daily") {
			numberOfDays = this.config.maxNumberOfDays < 1 || this.config.maxNumberOfDays > 5 ? 5 : this.config.maxNumberOfDays;
			// don't get forecasts for the next day, as it would not represent the whole day
			if (this.config.endpointType === "hourly") {
				numberOfDays = numberOfDays * 8 - (Math.round(new Date().getHours() / 3) % 8);
			}
		} else {
			numberOfDays = this.config.maxNumberOfDays < 1 || this.config.maxNumberOfDays > 17 ? 7 : this.config.maxNumberOfDays;
		}

		params += "&cnt=" + numberOfDays;
		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.language;
		params += "&APPID=" + this.config.appid;

		if (this.config.endpointType === "current") {
			params += "&exclude=minutely,hourly,daily";
		}
		else if (this.config.endpointType === "hourly") {
			params += "&exclude=current,minutely,daily,alerts";
		}
		else if (this.config.endpointType === "daily") {
			params += "&exclude=current,minutely,hourly,alerts";
		}
		else {
			params += "&exclude=minutely,alerts";
		}

		return params;
	},

	/* updateAir (Air Qualiti Index)
	 * Requests new data from openweather.org.
	 * Calls processAir on succesfull response.
	 */
	updateAir: function () {
		if (this.config.appid === "" || this.config.backup === "") {
			Log.error("Air Pollution: APPID not set!");
			return;
		}

		var url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + this.config.lat + "&lon=" + this.config.lon + "&appid=" + this.config.appid;
		var self = this;
		var retry = true;

		var airRequest = new XMLHttpRequest();
		airRequest.open("GET", url, true);
		airRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processAir(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					self.config.appid = self.config.backup;
					retry = true;
				} else {
					Log.error(self.name + ": Incorrect APPID. Could not load Air Pollution.");
				}

				if (retry) {
					self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
				}
			}
		};
		airRequest.send();
	},

	/* processAir(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - air quality information received form openweather.org.
	 */
	processAir: function (data, momenttz) {
		if (!data || !data.list === "undefined") {
			return;
		}

		var mom = momenttz ? momenttz : moment; // Exception last.

		this.aqi = data.list[0].main.aqi;
		this.aqi_t = mom(data.list[0].dt, "X").format("HH:mm");
		if (data.list[0].hasOwnProperty("components")) {
			var aqi_p = data.list[0].components;
			this.c_co = aqi_p.co;
			this.c_no = aqi_p.no;
			this.c_no2 = aqi_p.no2;
			this.c_o3 = aqi_p.o3;
			this.c_so2 = aqi_p.so2;
			this.c_pm25 = aqi_p.pm2_5;
			this.c_pm10 = aqi_p.pm10;
			this.c_nh3 = aqi_p.nh3;
		}

		if (!this.loaded) {
			this.show(this.config.animationSpeed, { lockString: this.identifier });
			this.loaded = true;
		}

		this.updateDom(this.config.animationSpeed);
		this.sendNotification("AIR_QUALITY", "AQI_" + this.aqi);
	},

	parserDataWeather: function (data) {
		if (data.hasOwnProperty("main")) {
			data["temp"] = { min: data.main.temp_min, max: data.main.temp_max };
		}
		return data;
	},

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather: function (data, momenttz) {
		if (!data || !data.current || typeof data.current.temp === "undefined") {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

		var mom = momenttz ? momenttz : moment; // Exception last.

		this.humidity = parseFloat(data.current.humidity);
		this.temperature = this.roundValue(data.current.temp);
		this.feelsLike = 0;
		this.desc = data.current.weather[0].description;	// weather description.
		this.pressure = data.current.pressure;				// main pressure.
		this.visibility = data.current.visibility;			// visibility.
		this.dew = data.current.dew_point;					// dew point.
		this.uvi = data.current.uvi;						// uv index.

		if (data.hasOwnProperty("alerts")) {
			this.start = mom(data.alerts[0].start, "X").format("HH:mm");
			this.end = mom(data.alerts[0].end, "X").format("HH:mm");
			this.alert = data.alerts[0].description;
		}

		this.temperature === "-0.0" ? 0.0 : this.temperature;

		var precip = false;
		if (data.current.hasOwnProperty("rain") && !isNaN(data.current["rain"]["1h"])) {
			if (this.config.units === "imperial") {
				this.rain = data.current["rain"]["1h"] / 25.4;
			} else {
				this.rain = data.current["rain"]["1h"];
			}
			precip = true;
		}
		if (data.current.hasOwnProperty("snow") && !isNaN(data.current["snow"]["1h"])) {
			if (this.config.units === "imperial") {
				this.snow = data.current["snow"]["1h"] / 25.4;
			} else {
				this.snow = data.current["snow"]["1h"];
			}
			precip = true;
		}
		if (precip) {
			this.precipitation = this.rain + this.snow;
		}

		if (this.config.useBeaufort) {
			this.windSpeed = this.ms2Beaufort(this.roundValue(data.current.wind_speed));
		} else if (this.config.useKMPHwind) {
			this.windSpeed = parseFloat((data.current.wind_speed * 60 * 60) / 1000).toFixed(0);
		} else {
			this.windSpeed = parseFloat(data.current.wind_speed).toFixed(0);
		}

		// ONLY WORKS IF TEMP IN C //
		var windInMph = parseFloat(data.current.wind_speed * 2.23694);

		var tempInF = 0;
		switch (this.config.units) {
			case "metric":
				tempInF = 1.8 * this.temperature + 32;
				break;
			case "imperial":
				tempInF = this.temperature;
				break;
			case "default":
				tempInF = 1.8 * (this.temperature - 273.15) + 32;
				break;
		}

		if (this.config.realFeelsLike) {
			this.feelsLike = parseFloat(data.current.feels_like).toFixed(0);
		} else if (windInMph > 3 && tempInF < 50) {
			// windchill
			var windChillInF = Math.round(35.74 + 0.6215 * tempInF - 35.75 * Math.pow(windInMph, 0.16) + 0.4275 * tempInF * Math.pow(windInMph, 0.16));
			var windChillInC = (windChillInF - 32) * (5 / 9);

			switch (this.config.units) {
				case "metric":
					this.feelsLike = windChillInC.toFixed(0);
					break;
				case "imperial":
					this.feelsLike = windChillInF.toFixed(0);
					break;
				case "default":
					this.feelsLike = (windChillInC + 273.15).toFixed(0);
					break;
			}
		} else if (tempInF > 80 && this.humidity > 40) {
			// heat index
			var Hindex =
				-42.379 +
				2.04901523 * tempInF +
				10.14333127 * this.humidity -
				0.22475541 * tempInF * this.humidity -
				6.83783 * Math.pow(10, -3) * tempInF * tempInF -
				5.481717 * Math.pow(10, -2) * this.humidity * this.humidity +
				1.22874 * Math.pow(10, -3) * tempInF * tempInF * this.humidity +
				8.5282 * Math.pow(10, -4) * tempInF * this.humidity * this.humidity -
				1.99 * Math.pow(10, -6) * tempInF * tempInF * this.humidity * this.humidity;

			switch (this.config.units) {
				case "metric":
					this.feelsLike = parseFloat((Hindex - 32) / 1.8).toFixed(0);
					break;
				case "imperial":
					this.feelsLike = Hindex.toFixed(0);
					break;
				case "default":
					var tc = parseFloat((Hindex - 32) / 1.8) + 273.15;
					this.feelsLike = tc.toFixed(0);
					break;
			}
		} else {
			this.feelsLike = parseFloat(this.temperature).toFixed(0);
		}
		
		this.windDirection = this.deg2Cardinal(data.current.wind_deg);
		this.windDeg = data.wind_deg;
		this.weatherType = this.config.iconTable[data.current.weather[0].icon];

		if (!this.loaded) {
			this.show(this.config.animationSpeed, { lockString: this.identifier });
			this.loaded = true;
		}
		this.updateDom(this.config.animationSpeed);
		this.sendNotification("CURRENTWEATHER_TYPE", { type: this.config.iconTable[data.current.weather[0].icon].replace("-", "_") });
	},

	processForecast: function (data, momenttz) {
		var mom = momenttz ? momenttz : moment; // Exception last.

		if (this.config.location) {
			this.fetchedLocationName = this.config.location;
		} else {
			this.fetchedLocationName = "Unknown";
		}

		this.forecast = [];
		var lastDay = null;
		var forecastData = {};
		var dayStarts = 7;
		var dayEnds = 18;

		// Handle different structs between onecall endpoints
		var forecastList = null;
		if (data.daily) {
			forecastList = data.daily;
		} else if (data.hourly) {
			forecastList = data.hourly;
		} else {
//			Log.error("Unexpected forecast data");
			return undefined;
		}

		for (var i = 0, count = forecastList.length; i < count; i++) {
			var forecast = forecastList[i];
			forecast = this.parserDataWeather(forecast); // hack issue #1017

			var day;
			var hour;
			if (forecast.dt_txt) {
				day = mom(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format(this.config.fullday);
				hour = new Date(mom(forecast.dt_txt).locale(this.config.language).format("YYYY-MM-DD HH:mm:ss")).getHours();
			} else {
				day = mom(forecast.dt, "X").format(this.config.fullday);
				hour = new Date(mom(forecast.dt, "X")).getHours();
			}

			if (day !== lastDay) {
				forecastData = {
					day: day,
					icon: this.config.iconTable[forecast.weather[0].icon],
					maxTemp: this.roundValue(forecast.temp.max),
					minTemp: this.roundValue(forecast.temp.min),
					rain: this.processRain(forecast, forecastList, mom),
					snow: this.processSnow(forecast, forecastList, mom),
					humidity: forecast.humidity,
					pressure: forecast.pressure,
					dayTemp: this.roundValue(forecast.temp),
					precip: this.roundValue(forecast.pop),
					realFeels: this.roundValue(forecast.feels_like),
					realFeelsDay: this.roundValue(forecast.feels_like.day),
					dewPoint: this.roundValue(forecast.dew_point),
					uvIndex: forecast.uvi,
					visibility: forecast.visibility,
				};

				this.forecast.push(forecastData);
				lastDay = day;

				// Stop processing when maxNumberOfDays is reached
				if (this.forecast.length === this.config.maxNumberOfDays) {
					break;
				}
			} else {
				//Log.log("Compare max: ", forecast.temp.max, parseFloat(forecastData.maxTemp));
				forecastData.maxTemp = forecast.temp.max > parseFloat(forecastData.maxTemp) ? this.roundValue(forecast.temp.max) : forecastData.maxTemp;
				//Log.log("Compare min: ", forecast.temp.min, parseFloat(forecastData.minTemp));
				forecastData.minTemp = forecast.temp.min < parseFloat(forecastData.minTemp) ? this.roundValue(forecast.temp.min) : forecastData.minTemp;

				// Since we don't want an icon from the start of the day (in the middle of the night)
				// we update the icon as long as it's somewhere during the day.
				if (hour > dayStarts && hour < dayEnds) {
					forecastData.icon = this.config.iconTable[forecast.weather[0].icon];
				}
			}
		}

		//Log.log(this.forecast);
		if (!this.loaded) {
			this.show(this.config.animationSpeed, { lockString: this.identifier });
			this.loaded = true;
		}
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function (delay) {
		var now = moment().format("HH:mm:ss");
		var updateInterval = null;

		if (now >= "07:00:00" && now <= "23:59:59") {
			updateInterval = this.config.dayUpdateInterval;
		} else {
			updateInterval = this.config.nightUpdateInterval;
		}

		var nextLoad = updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function () {
			if (self.config.endpointType === "aqi") {
				self.updateAir();
			} else {
				self.updateWeather();				
			}
		}, nextLoad);
	},

	/* ms2Beaufort(ms)
	 * Converts m2 to beaufort (windspeed).
	 *
	 * see:
	 *  https://www.spc.noaa.gov/faq/tornado/beaufort.html
	 *  https://en.wikipedia.org/wiki/Beaufort_scale#Modern_scale
	 *
	 * argument ms number - Windspeed in m/s.
	 *
	 * return number - Windspeed in beaufort.
	 */
	ms2Beaufort: function (ms) {
		var kmh = (ms * 60 * 60) / 1000;
		var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (var beaufort in speeds) {
			var speed = speeds[beaufort];
			if (speed > kmh) {
				return beaufort;
			}
		}
		return 12;
	},

	deg2Cardinal: function (deg) {
		if (deg > 11.25 && deg <= 33.75) {
			return "NNE";
		} else if (deg > 33.75 && deg <= 56.25) {
			return "NE";
		} else if (deg > 56.25 && deg <= 78.75) {
			return "ENE";
		} else if (deg > 78.75 && deg <= 101.25) {
			return "E";
		} else if (deg > 101.25 && deg <= 123.75) {
			return "ESE";
		} else if (deg > 123.75 && deg <= 146.25) {
			return "SE";
		} else if (deg > 146.25 && deg <= 168.75) {
			return "SSE";
		} else if (deg > 168.75 && deg <= 191.25) {
			return "S";
		} else if (deg > 191.25 && deg <= 213.75) {
			return "SSW";
		} else if (deg > 213.75 && deg <= 236.25) {
			return "SW";
		} else if (deg > 236.25 && deg <= 258.75) {
			return "WSW";
		} else if (deg > 258.75 && deg <= 281.25) {
			return "W";
		} else if (deg > 281.25 && deg <= 303.75) {
			return "WNW";
		} else if (deg > 303.75 && deg <= 326.25) {
			return "NW";
		} else if (deg > 326.25 && deg <= 348.75) {
			return "NNW";
		} else {
			return "N";
		}
	},

	/* function(temperature)
	 * Rounds a temperature to 1 decimal or integer (depending on config.roundTemp).
	 *
	 * argument temperature number - Temperature.
	 *
	 * return string - Rounded Temperature.
	 */
	roundValue: function (temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		var roundValue = parseFloat(temperature).toFixed(decimals);
		return roundValue === "-0" ? 0 : roundValue;
	},

	/* processRain(forecast, allForecasts)
	 * Calculates the amount of rain for a whole day even if long term forecasts isn't available for the appid.
	 *
	 * When using the the fallback endpoint forecasts are provided in 3h intervals and the rain-property is an object instead of number.
	 * That object has a property "3h" which contains the amount of rain since the previous forecast in the list.
	 * This code finds all forecasts that is for the same day and sums the amount of rain and returns that.
	 */
	processRain: function (forecast, allForecasts, momenttz) {
		var mom = momenttz ? momenttz : moment; // Exception last.

		//If the amount of rain actually is a number, return it
		if (this.config.endpointType === "hourly") {
			if (!isNaN(forecast.rain) && !isNaN(forecast.rain["1h"])) {
				return forecast.rain;
			}
		} else {
			if (!isNaN(forecast.rain)) {
				return forecast.rain;
			}
		}

		//Find all forecasts that is for the same day
		var checkDateTime = forecast.dt_txt ? mom(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(forecast.dt, "X");
		var daysForecasts = allForecasts.filter(function (item) {
			var itemDateTime = item.dt_txt ? mom(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(item.dt, "X");
			return itemDateTime.isSame(checkDateTime, "day") && item.rain instanceof Object;
		});

		//If no rain this day return undefined so it wont be displayed for this day
		if (daysForecasts.length === 0) {
			return undefined;
		}

		//Summarize all the rain from the matching days
		return daysForecasts
			.map(function (item) {
				return Object.values(item.rain)[0];
			})
			.reduce(function (a, b) {
				return a + b;
			}, 0);
	},

	processSnow: function (forecast, allForecasts, momenttz) {
		var mom = momenttz ? momenttz : moment; // Exception last.

		//If the amount of snow actually is a number, return it
		if (this.config.endpointType === "hourly") {
			if (!isNaN(forecast.snow) && !isNaN(forecast.snow["1h"])) {
				return forecast.snow;
			}
		} else {
			if (!isNaN(forecast.snow)) {
				return forecast.snow;
			}
		}

		//Find all forecasts that is for the same day
		var checkDateTime = forecast.dt_txt ? mom(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(forecast.dt, "X");
		var daysForecasts = allForecasts.filter(function (item) {
			var itemDateTime = item.dt_txt ? mom(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(item.dt, "X");
			return itemDateTime.isSame(checkDateTime, "day") && item.snow instanceof Object;
		});

		//If no snow this day return undefined so it wont be displayed for this day
		if (daysForecasts.length === 0) {
			return undefined;
		}

		//Summarize all the snow from the matching days
		return daysForecasts
			.map(function (item) {
				return Object.values(item.snow)[0];
			})
			.reduce(function (a, b) {
				return a + b;
			}, 0);
	}
});