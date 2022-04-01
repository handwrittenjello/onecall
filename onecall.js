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
		// optional settings only if oneLoader is not used
		lat: "",                               // your location latitude,
		lon: "",                               // your location longitude,
		appid: "",                             // your Openweathermap appid
		appid2: "",                            // optional
		backup: "",                            // optional backup appid
		dayUpdateInterval: 10 * 60 * 1000,     // every 10 minutes
		nightUpdateInterval: 15 * 60 * 1000,   // every 15 minutes

		// important settings
		endpointType: "onecall",     // "onecall", "current", "hourly", "daily" or "onecall"
		oneLoader: true,             // very important for just one API call

		// general settings
		location: "",
		units: config.units,
		initialLoadDelay: 0,         // 0 seconds delay
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		language: config.language,
		decimalSymbol: ".",
		degreeLabel: true,
		appendLocationNameToHeader: true,
		useLocationAsHeader: false,
		calendarClass: "calendar",
		tableClass: "small",
		showRainAmount: true,       // snow show only in winter months
		onlyTemp: false,
		hideTemp: false,
		roundTemp: false,           // error if is true

		// current settings
		showWindDirection: true,
		showWindDirectionAsArrow: false,	// not realy working
		showIndoorTemp_Hum: false,
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

		// hourly & daily settings
		flexDayForecast: true,      // show Flex Day Forecast, set maxNumberOfDays to 3 or 6
		maxNumberOfHours: 3,
		maxNumberOfDays: 6,
		fade: false,
		fadePoint: 0.25,            // Start on 1/4th of the list.
		colored: true,
		extraHourly: true,          // snow extra hourly humidity, dew point, pressure, real feel and rain or snow,
		extraDaily: true,           // snow extra daily humidity, dew point, pressure, real feel and rain or snow,
		daily: "dddd",              // "ddd" for short day name or "dddd" for full day name
		hourly: "HH.mm",			// "HH [h]" for hourly forecast or "HH.mm" for hour and minutes

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
		return {
			en: "en.json",
			ro: "ro.json"
        };
	},

	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(this.config.language);

		this.windSpeed = null;
		this.windDirection = null;
		this.windDeg = null;
		this.temperature = "0";
		this.weatherType = null;
		this.feelsLike = null;
		this.dew = null;				// dew point.
		this.uvi = null;				// uv index.
		this.desc = null;				// weather description.
		this.rain = null;				// current rain.
		this.snow = null;				// current snow.
		this.pressure = null;			// main pressure.
		this.visibility = null;			// visibility.
		this.start = null;
		this.end = null;
		this.alert = null;
		this.indoorTemperature = "NA";
		this.indoorHumidity = "NA";

		this.loaded = false;
		if (!this.config.oneLoader) {
			this.OneUpdate();
			this.scheduleUpdate(this.config.initialLoadDelay);
		}
	},

	// add extra information of current weather
	// windDirection, pressure, visibility and humidity
	addExtraInfoWeather: function (wrapper) {
		var small = document.createElement("div");
		small.className = "normal medium currentweather";

		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind cyan";
		small.appendChild(windIcon);

		if (this.config.showWindDirection) {
			var windDirection = document.createElement("span");
			if (this.config.showWindDirectionAsArrow) {
				if (this.windDeg !== null) {
				    windDirection.className = "wind";
					windDirection.innerHTML = " <i class=\"wi wi-direction-down\" style=\"transform:rotate(" + this.windDeg + "deg);\"></i>";
				}
			} else {
			    windDirection.className = "wind subs";
				windDirection.innerHTML = " " + this.translate(this.windDirection);
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
		if (this.config.units === "metric" || this.config.units === "default") {
			windSpeedUnit.innerHTML = " km/h ";
		} else if (this.config.units === "imperial") {
			windSpeedUnit.innerHTML = " mph ";
		}
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
			if (this.config.units === "metric" || this.config.units === "default") {
				visibilityUnit.innerHTML = " km ";
			} else if (this.config.units === "imperial") {
				visibilityUnit.innerHTML = " mi ";
			}
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
		if (!this.config.oneLoader) {
			if (this.config.appid === "") {
				var wrapper = document.createElement("div");
				wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
				wrapper.className = "dimmed light small";
				return wrapper;
			}
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

		var wrapper = document.createElement("div");
		wrapper.className = "current weather normal";

		if (this.config.endpointType === "current" || this.config.endpointType === "onecall") {

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
				var iconwrapper = document.createElement("span");
				if (this.config.defaultIcons) {
					iconwrapper.className = "current-weather mlarge";
					iconwrapper.style.transform = "translate(0) !important";
				} else {
					iconwrapper.className = "currentweather";
				}
				large.appendChild(iconwrapper);

				var weatherIcon = document.createElement("span");
				weatherIcon.className = "wi weathericon wi-" + this.weatherType;
				iconwrapper.appendChild(weatherIcon);

				var tempwrapper = document.createElement("span");
				tempwrapper.className = "currentweather";
				large.appendChild(tempwrapper);

				var temperature = document.createElement("span");
				temperature.className = "bright light xlarge";
				temperature.innerHTML = " " + this.temperature.replace(".", this.config.decimalSymbol) + "&deg;<span class=\"deg\">" + degreeLabel + "</span>";
				tempwrapper.appendChild(temperature);
			}

			if (this.config.showIndoorTemp_Hum) {
				var indoorSpace = document.createElement("br");
				large.appendChild(indoorSpace);

				var indoorIcon = document.createElement("span");
				indoorIcon.className = "medium fa fa-home gold";
				large.appendChild(indoorIcon);

				var indoorTemperature = document.createElement("span");
				indoorTemperature.className = "medium bright";
				indoorTemperature.innerHTML = "&nbsp; <i class=\"fa fa-thermometer orange\"></i> " + this.indoorTemperature.replace(".", this.config.decimalSymbol) + "&deg;" + degreeLabel;
				large.appendChild(indoorTemperature);

				var indoorHumidity = document.createElement("span");
				indoorHumidity.className = "medium bright";
				indoorHumidity.innerHTML = " <i class=\"fa fa-tint skyblue\"></i> " + this.indoorHumidity + "%";
				large.appendChild(indoorHumidity);
			}

			wrapper.appendChild(large);

			if (this.config.onlyTemp === false) {
				var small = document.createElement("div");
				small.className = "normal medium details";

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

					feelsLike.innerHTML = this.translate("FEELS", {DEGREE: "<span class=\"currentweather\"><i class=\"wi wi-thermometer yellow\"></i></span> " + this.feelsLike + "&deg;" + degreeLabel});
					small.appendChild(feelsLike);
				}

				// dew point.
				if (this.config.showDew) {
					var dew = document.createElement("span"); 
					dew.className = "dew midget cyan";
					dew.innerHTML = this.translate("DEW") + "<i class=\"wi wi-raindrops lightgreen\"></i> " + this.dew.toFixed(1).replace(".", this.config.decimalSymbol) + "&deg;" + degreeLabel;
					small.appendChild(dew);
				}

				// uv index.
				if (this.config.showUvi) {
					var uvi = document.createElement("span");
					uvi.className = "uvi midget";
					uvi.innerHTML = this.translate("UVI") + "<i class=\"wi wi-hot gold\"></i>" + this.uvi.toFixed(1).replace(".", this.config.decimalSymbol);
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
				if (this.config.showRainAmount) {
					var precipitation = document.createElement("div");
					precipitation.className = "prep midget";
					if (this.precipitation > 0) {
						if(config.units === "imperial") {
							precipitation.innerHTML = this.translate("PRECIP") + " " + (this.precipitation / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
						} else {
							precipitation.innerHTML = this.translate("PRECIP") + " " + this.precipitation.toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
						}
					} else {
						precipitation.innerHTML = this.translate("No prep") + " &nbsp; <i class=\"fa fa-tint-slash skyblue\"></i>";
					}
					small.appendChild(precipitation);
				}

				// weather description.
				if (this.config.showDescription) {
					var descwrapper = document.createElement("span");
					descwrapper.className = "currentweather";
					small.appendChild(descwrapper);

					var description = document.createElement("div");
					description.className = "bright description";
					description.innerHTML = this.desc;
					descwrapper.appendChild(description);
				}

				if (this.config.showAlerts && (this.alert !== null)) {
					var alerts = document.createElement("div");
					alerts.className = "midget coral alerts";
					alerts.innerHTML = "<i class=\"wi wi-small-craft-advisory\"></i> " + this.translate("ALERTS") + this.start + " - " + this.end + "<br>" + this.alert;
					small.appendChild(alerts);
				}

				wrapper.appendChild(small);
			}
		}

		//	if (this.config.endpointType === "current") {
		//		return wrapper;
		//	}

		if (this.config.endpointType === "hourly" || this.config.endpointType === "onecall") {

			if (this.config.appendLocationNameToHeader && this.config.endpointType === "onecall") {
				var header = document.createElement("header");
				header.className = "header";
				header.innerHTML = "<i class=\"wi wi-day-cloudy skyblue\"></i>&nbsp; " + this.translate("Next hours") + this.config.location;
				wrapper.appendChild(header);
			}

			if (this.config.flexDayForecast) {
				var container = document.createElement("div");
				container.className = "hourly flex-container weatherforecast small normal";
				if (this.config.defaultIcons) {
					container.style.flexWrap = "nowrap";
					container.style.gap = "30px";
				} else {
					container.style.flexWarp = "warp";
				}

				for (var f in this.forecastHourly) {
					var forecast = this.forecastHourly[f];

					var item = document.createElement("div");
					if (this.config.defaultIcons) {
						item.className = "item forecast weatherforecast";
						item.style.lineHeight = "1.8rem";
					} else {
						item.className = "item forecast currentweather";
					}
					container.appendChild(item);

					var dayCell = document.createElement("div");
					dayCell.className = "fday smedium";
					dayCell.innerHTML = forecast.hour + " h";
					item.appendChild(dayCell);

					var icon = document.createElement("div");
					icon.className = "wi weathericon wi-" + forecast.icon;
					if (this.config.defaultIcons) {
						icon.style.transform = "scale(2)";
						icon.style.padding = "17px";
					} else {
						icon.style.transform = "scale(0.8)";
					}
					item.appendChild(icon);

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

					var medTempCell = document.createElement("div");
					medTempCell.innerHTML = forecast.hourTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					medTempCell.className = "dayTemp yellow medium";
					item.appendChild(medTempCell);

					if (this.config.showRainAmount) {
						var rainCell = document.createElement("div");
						rainCell.className = "midget bright";
						if (!forecast.snow && !forecast.rain) {
							rainCell.className = "midget normal";
							rainCell.innerHTML = this.translate("No rain") + "&nbsp; <i class=\"fa fa-tint-slash skyblue medium\"></i>";
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

						item.appendChild(rainCell);
					} 

					if (this.config.extraHourly) {
						var humidity = document.createElement("span");
						humidity.innerHTML = "<i class=\"wi wi-humidity\"></i> " + parseFloat(forecast.humidity).toFixed(0) + "%";
						humidity.className = "humidity skyblue extra";
						item.appendChild(humidity);

						var dewPoint = document.createElement("span");
						dewPoint.innerHTML = "&nbsp; " + parseFloat(forecast.dewPoint).toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
						dewPoint.className = "dewPoint cyan extra";
						item.appendChild(dewPoint);

						var pressure = document.createElement("span");
						pressure.innerHTML = "<br>" + Math.round(forecast.pressure * 750.062 / 1000).toFixed(0) + " Hg";
						pressure.className = "pressure gold extra";
						item.appendChild(pressure);
						
						var uvIndex = document.createElement("span");
						uvIndex.innerHTML = "&nbsp; UV " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
						uvIndex.className = "uvIndex lightgreen extra";
						item.appendChild(uvIndex);
					}

					container.appendChild(item);
				}

				wrapper.appendChild(container);

			} else {

				var table = document.createElement("table");
				table.className = "hourly weatherforecast " + this.config.tableClass;

				for (var f in this.forecastHourly) {
					var forecast = this.forecastHourly[f];

					var row = document.createElement("tr");
					row.className = "forecast normal";
					table.appendChild(row);

					var dayCell = document.createElement("td");

					if (this.config.language == "ro") {
						dayCell.className = "align-left day ro";
					} else dayCell.className = "align-left day en";

					dayCell.innerHTML = forecast.hour;
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

					var medTempCell = document.createElement("td");
					medTempCell.innerHTML = forecast.hourTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					medTempCell.className = "align-center yellow";
					row.appendChild(medTempCell);

					var realFeel = document.createElement("td");
					realFeel.innerHTML = parseFloat(forecast.realFeels).toFixed(0).replace(".", this.config.decimalSymbol) + degreeLabel;
					realFeel.className = "align-center lime";
					row.appendChild(realFeel);	

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
						var startingPoint = this.forecastHourly.length * this.config.fadePoint;
						var steps = this.forecastHourly.length - startingPoint;
						if (f >= startingPoint) {
							var currentStep = f - startingPoint;
							row.style.opacity = 1 - (1 / steps) * currentStep;
						}
					}

					// add extra information of weather forecast
					// humidity, dew point,, pressure, visibility and UV index

					if (this.config.extraHourly) {
						var row = document.createElement("tr");
						row.className = "extra normal";
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

						var visible = document.createElement("td");
						if (this.config.units === "metric" || this.config.units === "default") {
							visible.innerHTML =  forecast.visibility/1000 + " Km";
						} else if (this.config.units === "imperial") {
							visible.innerHTML =  Math.round(forecast.visibility/1000).toFixed(2) + " mi";
						}
						visible.className = "align-center violet visibility";
						row.appendChild(visible);

						var uvIndex = document.createElement("td");
						uvIndex.innerHTML = "UVI " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
						uvIndex.className = "align-right uvIndex lightgreen";
						row.appendChild(uvIndex);
					}

					if (this.config.fade && this.config.fadePoint < 1) {
						if (this.config.fadePoint < 0) {
							this.config.fadePoint = 0;
						}
						var startingPoint = this.forecastHourly.length * this.config.fadePoint;
						var steps = this.forecastHourly.length - startingPoint;
						if (f >= startingPoint) {
							var currentStep = f - startingPoint;
							row.style.opacity = 1 - (1 / steps) * currentStep;
						}
					}
				}

				wrapper.appendChild(table);
			}
		}

		if (this.config.endpointType === "daily" || this.config.endpointType === "onecall") {

			if (this.config.appendLocationNameToHeader && this.config.endpointType === "onecall") {
				var header = document.createElement("header");
				header.className = "header";
				header.innerHTML = "<i class=\"wi wi-day-cloudy skyblue\"></i>&nbsp; " + this.translate("Next days") + this.config.location;
				wrapper.appendChild(header);
			}

			if (this.config.flexDayForecast) {
				var container = document.createElement("div");
				container.className = "daily flex-container weatherforecast small normal";

				for (var f in this.forecastDaily) {
					var forecast = this.forecastDaily[f];

					var item = document.createElement("div");
					if (this.config.defaultIcons) {
						item.className = "item forecast weatherforecast";
						item.style.lineHeight = "1.8rem";
					} else {
						item.className = "item forecast currentweather";
					}
					container.appendChild(item);

					var dayCell = document.createElement("div");
					dayCell.className = "fday smedium";
					dayCell.innerHTML = forecast.day;
					item.appendChild(dayCell);

					var icon = document.createElement("div");
					icon.className = "wi weathericon wi-" + forecast.icon;
					if (this.config.defaultIcons) {
						icon.style.transform = "scale(2)";
						icon.style.padding = "17px";
					} else {
						icon.style.transform = "scale(0.8)";
					}
					item.appendChild(icon);

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

					var maxTempCell = document.createElement("div");
					maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					maxTempCell.className = "maxtemp coral medium";
					item.appendChild(maxTempCell);

					var minTempCell = document.createElement("div");
					minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					minTempCell.className = "mintemp skyblue medium";
					item.appendChild(minTempCell);


					if (this.config.showRainAmount) {
						var rainCell = document.createElement("div");
						rainCell.className = "midget bright";
						if (!forecast.snow && !forecast.rain) {
							rainCell.className = "midget normal";
							rainCell.innerHTML = this.translate("No rain") + "&nbsp; <i class=\"fa fa-tint-slash skyblue medium\"></i>";
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

							item.appendChild(rainCell);
						}

					if (this.config.extraDaily) {
						var humidity = document.createElement("span");
						humidity.innerHTML = "<i class=\"wi wi-humidity\"></i> " + parseFloat(forecast.humidity).toFixed(0) + "%";
						humidity.className = "humidity skyblue extra";
						item.appendChild(humidity);

						var dewPoint = document.createElement("span");
						dewPoint.innerHTML = "&nbsp; " + parseFloat(forecast.dewPoint).toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
						dewPoint.className = "dewPoint cyan extra";
						item.appendChild(dewPoint);

						var pressure = document.createElement("span");
						pressure.innerHTML = "<br>" + Math.round(forecast.pressure * 750.062 / 1000).toFixed(0) + " Hg";
						pressure.className = "pressure gold extra";
						item.appendChild(pressure);
						
						var uvIndex = document.createElement("span");
						uvIndex.innerHTML = "&nbsp; UV " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
						uvIndex.className = "uvIndex lightgreen extra";
						item.appendChild(uvIndex);

						container.appendChild(item);
					}
				}

				wrapper.appendChild(container);

			} else {

				var table = document.createElement("table");
				table.className = "daily weatherforecast " + this.config.tableClass;

				for (var f in this.forecastDaily) {
					var forecast = this.forecastDaily[f];

					var row = document.createElement("tr");
					row.className = "forecast normal";
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

					var maxTempCell = document.createElement("td");
					maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					maxTempCell.className = "align-center max-temp coral";
					row.appendChild(maxTempCell);

					var minTempCell = document.createElement("td");
					minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					minTempCell.className = "align-center min-temp skyblue";
					row.appendChild(minTempCell);

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
						var startingPoint = this.forecastDaily.length * this.config.fadePoint;
						var steps = this.forecastDaily.length - startingPoint;
						if (f >= startingPoint) {
							var currentStep = f - startingPoint;
							row.style.opacity = 1 - (1 / steps) * currentStep;
						}
					}

					// add extra information of weather forecast
					// humidity, dew point,, pressure, feels like and UV index

					if (this.config.extraDaily) {
						var row = document.createElement("tr");
						row.className = "extra normal";
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

						var realFeelDay = document.createElement("td");
						realFeelDay.innerHTML =  parseFloat(forecast.realFeelsDay).toFixed(0) + degreeLabel;
						realFeelDay.className = "align-center realFeel yellow";
						row.appendChild(realFeelDay);
							
						var uvIndex = document.createElement("td");
						uvIndex.innerHTML = "UVI " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
						uvIndex.className = "align-right uvIndex lightgreen";
						row.appendChild(uvIndex);
					}

					if (this.config.fade && this.config.fadePoint < 1) {
						if (this.config.fadePoint < 0) {
							this.config.fadePoint = 0;
						}
						var startingPoint = this.forecastDaily.length * this.config.fadePoint;
						var steps = this.forecastDaily.length - startingPoint;
						if (f >= startingPoint) {
							var currentStep = f - startingPoint;
							row.style.opacity = 1 - (1 / steps) * currentStep;
						}
					}
				}

				wrapper.appendChild(table);
			}
		}
		
		return wrapper;
	},

	// Override getHeader method.
	getHeader: function () {
		if (this.config.useLocationAsHeader && this.config.location !== false) {
			return this.config.location;
		}

		if (this.config.appendLocationNameToHeader) {
			if (this.data.header) return this.data.header + " " + this.config.location;
		}

		return this.data.header ? this.data.header : "";
	},

	/* updateWeather(compliments)
	 * Requests new data from openweather.org.
	 * Calls processWeather on succesfull response.
	 */
	OneUpdate: function () {
		if (this.config.appid === "") {
			Log.error("OneCall: APPID not set!");
			return;
		}

		var params = "?lat=" + this.config.lat + "&lon=" + this.config.lon + "&units=" + config.units + "&lang=" + config.language;
		var url = "https://api.openweathermap.org/data/2.5/onecall" + params + "&exclude=minutely" + "&appid=" + this.config.appid;
		var self = this;

		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					if (self.config.endpointType === "current") {
						self.processWeather(JSON.parse(this.response));
					}
					else if (self.config.endpointType === "hourly") {
						self.processHourly(JSON.parse(this.response));
					}
					else if (self.config.endpointType === "daily") {
						self.processDaily(JSON.parse(this.response));
					}
					else if (self.config.endpointType === "onecall"){
						self.processWeather(JSON.parse(this.response));
						self.processDaily(JSON.parse(this.response));
						self.processHourly(JSON.parse(this.response));
					}
				} else if (this.status === 401 || this.status === 429) {
					self.updateDom(self.config.animationSpeed);
					if (self.config.backup === "") {
						Log.error("OneCall: backup APPID not set!");
						return;
					} else {
						self.config.appid = self.config.backup;
					}
				} else {
					Log.error(self.name + ": Incorrect APPID. Could not load weather.");
				}
			}
		};
		weatherRequest.send();
	},
	
	/* scheduleUpdate()
	 * Schedule next update.
	 */
	scheduleUpdate: function () {
		var now = moment().format("HH:mm:ss");
		var updateInterval = null;
		var self = this;

		if (now >= "07:00:00" && now <= "23:59:59") {
			updateInterval = this.config.dayUpdateInterval;
		} else {
			updateInterval = this.config.nightUpdateInterval;
		}

		setInterval(function () {
			self.OneUpdate();
		}, updateInterval);
	},

	// Override notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification === "ONE_RESPONSE") {
			if (this.config.endpointType === "current") {
				this.processWeather(payload);
			}
			if (this.config.endpointType === "daily") {
				this.processDaily(payload);
			}
			if (this.config.endpointType === "hourly") {
				this.processHourly(payload);
			}
			if (this.config.endpointType === "onecall") {
				this.processWeather(payload);
				this.processDaily(payload);
				this.processHourly(payload);
			}
		//	Log.info("One " + payload);
		}

		if (notification === "INDOOR_TEMPERATURE") {
			this.indoorTemperature = this.roundValue(payload);
			this.updateDom(this.config.animationSpeed);
		}
		if (notification === "INDOOR_HUMIDITY") {
			this.indoorHumidity = this.roundValue(payload);
			this.updateDom(this.config.animationSpeed);
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

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather: function (data) {
		if (!data || !data.current || typeof data.current.temp === "undefined") {
			// Did not receive usable new data. Maybe this needs a better check?
			return;
		}

		this.humidity = parseFloat(data.current.humidity);
		this.temperature = this.roundValue(data.current.temp);
		this.feelsLike = parseFloat(data.current.feels_like).toFixed(0);
		this.desc = data.current.weather[0].description;	// weather description.
		this.pressure = data.current.pressure;				// main pressure.
		this.visibility = data.current.visibility;			// visibility.
		this.dew = data.current.dew_point;					// dew point.
		this.uvi = data.current.uvi;						// uv index.

		if (data.hasOwnProperty("alerts")) {
			this.start = moment(data.alerts[0].start, "X").format("HH:mm");
			this.end = moment(data.alerts[0].end, "X").format("HH:mm");
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

		this.windDirection = this.deg2Cardinal(data.current.wind_deg);
		this.windDeg = data.wind_deg;
		this.weatherType = this.config.iconTable[data.current.weather[0].icon];

		this.show(this.config.animationSpeed, { lockString: this.identifier });
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);

		this.sendNotification("CURRENTWEATHER_TYPE", { type: this.config.iconTable[data.current.weather[0].icon].replace("-", "_") });
	//	Log.info("CURRENTWEATHER_TYPE", { type: this.config.iconTable[data.current.weather[0].icon].replace("-", "_") });
	},

	processDaily: function (data) {
		this.forecastDaily = [];
		var lastDay = null;
		var forecastData = {};
		var dayStarts = 7;
		var dayEnds = 18;

		// Handle different structs between onecall endpoints
		var forecastList = null;
		if (data.daily) {
			forecastList = data.daily;
		} else {
		//	Log.error("Unexpected forecast data");
			return undefined;
		}

		for (var i = 0, count = forecastList.length; i < count; i++) {
			var forecast = forecastList[i];

			var day;
			if (forecast.dt_txt) {
				day = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format(this.config.daily);
			} else {
				day = moment(forecast.dt, "X").format(this.config.daily);
			}

			if (day !== lastDay) {
				forecastData = {
					day: day,
					icon: this.config.iconTable[forecast.weather[0].icon],
					maxTemp: this.roundValue(forecast.temp.max),
					minTemp: this.roundValue(forecast.temp.min),
					rain: this.processRain(forecast, forecastList, moment),
					snow: this.processSnow(forecast, forecastList, moment),
					humidity: forecast.humidity,
					pressure: forecast.pressure,
					precip: this.roundValue(forecast.pop),
					realFeelsDay: this.roundValue(forecast.feels_like.day),
					dewPoint: this.roundValue(forecast.dew_point),
					uvIndex: forecast.uvi,
					visibility: forecast.visibility,
				};

				this.forecastDaily.push(forecastData);
				lastDay = day;

				// Stop processing when maxNumberOfDays is reached
				if (this.forecastDaily.length === this.config.maxNumberOfDays) {
					break;
				}
			} else {
			//	Log.log("Compare max: ", forecast.temp.max, parseFloat(forecastData.maxTemp));
				forecastData.maxTemp = forecast.temp.max > parseFloat(forecastData.maxTemp) ? this.roundValue(forecast.temp.max) : forecastData.maxTemp;
			//	Log.log("Compare min: ", forecast.temp.min, parseFloat(forecastData.minTemp));
				forecastData.minTemp = forecast.temp.min < parseFloat(forecastData.minTemp) ? this.roundValue(forecast.temp.min) : forecastData.minTemp;

				// Since we don't want an icon from the start of the day (in the middle of the night)
				// we update the icon as long as it's somewhere during the day.
				if (hour > dayStarts && hour < dayEnds) {
					forecastData.icon = this.config.iconTable[forecast.weather[0].icon];
				}
			}
		}

		//	Log.log(this.forecastDaily);
		this.show(this.config.animationSpeed, { lockString: this.identifier });
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	processHourly: function (data) {
		this.forecastHourly = [];
		var lastHour = null;
		var forecastData = {};
		var hourStarts = 7;
		var hourEnds = 18;

		// Handle different structs between onecall endpoints
		var forecastList = null;
		if (data.hourly) {
			forecastList = data.hourly;
		} else {
		//	Log.error("Unexpected forecast data");
			return undefined;
		}

		for (var i = 0, count = forecastList.length; i < count; i++) {
			var forecast = forecastList[i];

			var hour;
			if (forecast.dt_txt) {
				hour = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format(this.config.hourly);
			} else {
				hour = moment(forecast.dt, "X").format(this.config.hourly);
			}

			if (hour !== lastHour) {
				forecastData = {
					hour: hour,
					icon: this.config.iconTable[forecast.weather[0].icon],
					rain: this.processRain(forecast, forecastList, moment),
					snow: this.processSnow(forecast, forecastList, moment),
					humidity: forecast.humidity,
					pressure: forecast.pressure,
					hourTemp: this.roundValue(forecast.temp),
					precip: this.roundValue(forecast.pop),
					realFeels: this.roundValue(forecast.feels_like),
					dewPoint: this.roundValue(forecast.dew_point),
					uvIndex: forecast.uvi,
					visibility: forecast.visibility,
				};

				this.forecastHourly.push(forecastData);
				lastHour = hour;

				// Stop processing when maxNumberOfHours is reached
				if (this.forecastHourly.length === this.config.maxNumberOfHours) {
					break;
				}
			} else {
				// Since we don't want an icon from the start of the day (in the middle of the night)
				// we update the icon as long as it's somewhere during the day.
				if (hour > hourStarts && hour < hourEnds) {
					forecastData.icon = this.config.iconTable[forecast.weather[0].icon];
				}
			}
		}

		//	Log.log(this.forecastHourly);
		this.show(this.config.animationSpeed, { lockString: this.identifier });
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
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
	processRain: function (forecast, allForecasts) {
		// If the amount of rain actually is a number, return it
		if (this.config.endpointType === "hourly" && this.config.endpointType === "onecall") {
			if (!isNaN(forecast.rain) && !isNaN(forecast.rain["1h"])) {
				return forecast.rain;
			}
		} else {
			if (!isNaN(forecast.rain)) {
				return forecast.rain;
			}
		}

		// Find all forecasts that is for the same day
		var checkDateTime = forecast.dt_txt ? moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(forecast.dt, "X");
		var daysForecasts = allForecasts.filter(function (item) {
			var itemDateTime = item.dt_txt ? moment(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(item.dt, "X");
			return itemDateTime.isSame(checkDateTime, "day") && item.rain instanceof Object;
		});

		// If no rain this day return undefined so it wont be displayed for this day
		if (daysForecasts.length === 0) {
			return undefined;
		}

		// Summarize all the rain from the matching days
		return daysForecasts
			.map(function (item) {
				return Object.values(item.rain)[0];
			})
			.reduce(function (a, b) {
				return a + b;
			}, 0);
	},

	processSnow: function (forecast, allForecasts) {
		// If the amount of snow actually is a number, return it
		if (this.config.endpointType === "hourly" && this.config.endpointType === "onecall") {
			if (!isNaN(forecast.snow) && !isNaN(forecast.snow["1h"])) {
				return forecast.snow;
			}
		} else {
			if (!isNaN(forecast.snow)) {
				return forecast.snow;
			}
		}

		// Find all forecasts that is for the same day
		var checkDateTime = forecast.dt_txt ? moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(forecast.dt, "X");
		var daysForecasts = allForecasts.filter(function (item) {
			var itemDateTime = item.dt_txt ? moment(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(item.dt, "X");
			return itemDateTime.isSame(checkDateTime, "day") && item.snow instanceof Object;
		});

		// If no snow this day return undefined so it wont be displayed for this day
		if (daysForecasts.length === 0) {
			return undefined;
		}

		// Summarize all the snow from the matching days
		return daysForecasts
			.map(function (item) {
				return Object.values(item.snow)[0];
			})
			.reduce(function (a, b) {
				return a + b;
			}, 0);
	}
});
