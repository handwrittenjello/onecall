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
		lat: "",	// your location latitude,
		lon: "",	// your location longitude,
		location: "",	// your location,
		appid: "",	// your openweathermap API key,
		backup: "",	// second openweathermap API key,
		units: "",	// your units, metric or imperial
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
		endpointType: "current",

		appendLocationNameToHeader: true,
		useLocationAsHeader: false,

		calendarClass: "calendar",
		tableClass: "small",

		onlyTemp: false,
		hideTemp: false,
		roundTemp: false, // error on true

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
		this.temperature = null;
		this.weatherType = null;
		this.feelsLike = null;
		this.dew = null;				// dew point.
		this.uvi = null;				// uv index.
		this.desc = null;	 			// weather description.
		this.rain = null;	 			// rain.
		this.snow = null;	 			// snow.
		this.pressure = null;	 		// main pressure.
		this.visibility = null;	 		// visibility.

		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.forecast = [];
		this.updateTimer = null;
	},

	// add extra information of current weather
	// windDirection, humidity, sunrise and sunset
	addExtraInfoWeather: function (wrapper) {
		var small = document.createElement("div");
		small.className = "normal medium";

		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind";
		small.appendChild(windIcon);

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);

		if (this.config.showWindDirection) {
			var windDirection = document.createElement("span");
			windDirection.className = "wind";
			if (this.config.showWindDirectionAsArrow) {
				if (this.windDeg !== null) {
					windDirection.innerHTML = "<i class=\"wi wi-direction-down\" style=\"transform:rotate(" + this.windDeg + "deg);\"></i>";
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
		windSpeedUnit.innerHTML = " km/h";
		small.appendChild(windSpeedUnit);

		var spacer = document.createElement("span");
		spacer.innerHTML = " &nbsp;";
		small.appendChild(spacer);

		// pressure.
		if (this.config.showPressure) {
			var pressureIcon = document.createElement("span");
			pressureIcon.className = "wi wi-barometer";
			small.appendChild(pressureIcon);

			var pressure = document.createElement("span");
			var atpressure = Math.round(this.pressure * 750.062 / 1000);
				if (atpressure < 745) {
				    pressure.className = "pressure lightblue";
				} else if (atpressure > 775) {
				    pressure.className = "pressure orange";
				} else pressure.className = "pressure greenyellow";
			pressure.innerHTML = " " + Math.round(this.pressure * 750.062 / 1000);
			small.appendChild(pressure);

			var pressureSub = document.createElement("span");
			pressureSub.className = "subs";
			pressureSub.innerHTML = " Hg ";
			small.appendChild(pressureSub);
		}

		// visibility.
		if (this.config.showVisibility) {
			var visibilityIcon = document.createElement("span");
			visibilityIcon.className = "fa fa-binoculars";
			small.appendChild(visibilityIcon);

			var visibility = document.createElement("span");
			visibility.className = "visibility";
			visibility.innerHTML = this.visibility / 1000;
			small.appendChild(visibility);

			var visibilityUnit = document.createElement("span");
			visibilityUnit.className = "subs";
			visibilityUnit.innerHTML = " km";
			small.appendChild(visibilityUnit);
		}

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);

		// humidity.
		if (this.config.showHumidity) {
			var humidityIcon = document.createElement("span");
			humidityIcon.className = "wi wi-humidity humidityIcon";
			small.appendChild(humidityIcon);

			var humidity = document.createElement("span");
			if (this.humidity < 30) {
			    humidity.className = "lightblue";
			} else if (this.humidity > 50 && this.humidity < 80) {
			    humidity.className = "yellow";
			} else if (this.humidity > 80) {
			    humidity.className = "coral";
			} else humidity.className = " ";
			humidity.innerHTML = " " + this.humidity + "%";
			small.appendChild(humidity);
		}

		wrapper.appendChild(small);
	},

	// Override dom generator.
	getDom: function () {
		if (this.config.endpointType === "current") {
			var wrapper = document.createElement("div");
			if (!this.config.colored) {
				wrapper.className = "grayscale currentweather";
			} else {
				wrapper.className = "currentweather";
			}

			if (this.config.appid === "") {
				wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
				wrapper.className = "dimmed light small";
				return wrapper;
			}

			if (!this.loaded) {
				wrapper.innerHTML = this.translate("LOADING");
				wrapper.className = "dimmed light small";
				return wrapper;
			}

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

				var spacer = document.createElement("span");
				spacer.innerHTML = "<br>";
				large.appendChild(spacer);
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

					feelsLike.innerHTML = this.translate("FEELS") + "<i class=\"wi wi-thermometer\"></i>" + this.feelsLike + "&deg;" + degreeLabel;
					small.appendChild(feelsLike);
				}

				// dew point.
				if (this.config.showDew) {
					var dew = document.createElement("span"); 
					dew.className = "dew midget lightskyblue";
					dew.innerHTML = this.translate("DEW") + "<i class=\"wi wi-raindrops lightgreen\"></i> " + this.dew.toFixed(1) + "&deg;" + degreeLabel;
					small.appendChild(dew);
				}

				var spacer = document.createElement("span");
				spacer.innerHTML = "&nbsp;";
				small.appendChild(spacer);

				// uv index.
				if (this.config.showUvi) {
					var uvi = document.createElement("span");
					uvi.className = "uvi midget";
					uvi.innerHTML = this.translate("UVI") + "<i class=\"wi wi-hot\"></i>" + this.uvi.toFixed(1);
					if (this.uvi < 0.1) {
						uvi.className = uvi.className + " lightblue";
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
					var spacer = document.createElement("span");
					spacer.innerHTML = "<br>";
					small.appendChild(spacer);

					var precipitation = document.createElement("span");
					precipitation.className = "prep midget";
					if (this.precipitation > 0) {
						if(config.units === "imperial") {
							precipitation.innerHTML = this.translate("PRECIP") + " " + (this.precipitation / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in ";
						} else {
							precipitation.innerHTML = this.translate("PRECIP") + " " + this.precipitation.toFixed(1).replace(".", this.config.decimalSymbol) + " mm ";
						}
					} else {
						precipitation.innerHTML = this.translate("No prep") + " ";
					}
					small.appendChild(precipitation);

					var prepIcon = document.createElement("span");
					if (this.precipitation > 0) {
						prepIcon.className = "fa fa-tint prep";
					} else {
						prepIcon.className = "fa fa-tint-slash prep";
					}
					small.appendChild(prepIcon);
				}

				// weather description.
				if (this.config.showDescription) {
					var description = document.createElement("div");
					description.className = "bright";
					description.innerHTML = this.desc;
					small.appendChild(description);
				}

				wrapper.appendChild(small);
			}

			return wrapper;

		} else {

			var table = document.createElement("table");
			table.className = "weatherforecast " + this.config.tableClass;

			for (var f in this.forecast) {
				var forecast = this.forecast[f];

				var row = document.createElement("tr");
				if (!this.config.colored) {
					row.className = "grayscale";
				}
				table.appendChild(row);

				var dayCell = document.createElement("td");

				if (this.config.language == "ro") {
					dayCell.className = "day ro";
				} else dayCell.className = "day en";

				dayCell.innerHTML = forecast.day;
				row.appendChild(dayCell);

				var iconCell = document.createElement("td");
				iconCell.className = "bright weather-icon";
				row.appendChild(iconCell);

				var icon = document.createElement("span");
				icon.className = "wi forecasticon wi-" + forecast.icon;
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
					medTempCell.className = "lime";
					row.appendChild(medTempCell);

					var realFeel = document.createElement("td");
					realFeel.innerHTML = "<i class=\"wi wi-thermometer little\"></i> " + parseFloat(forecast.realFeels).toFixed(0).replace(".", this.config.decimalSymbol) + degreeLabel;
					realFeel.className = "yellow";
					row.appendChild(realFeel);	
				} else {
					var maxTempCell = document.createElement("td");
					maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					maxTempCell.className = "coral";
					row.appendChild(maxTempCell);

					var minTempCell = document.createElement("td");
					minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					minTempCell.className = "skyblue";
					row.appendChild(minTempCell);
				}

				if (this.config.showRainAmount) {
					var rainCell = document.createElement("td");
					if (isNaN(forecast.rain)) {
						rainCell.className = "align-right shade";
						rainCell.innerHTML = this.translate("No rain") + " <i class=\"fa fa-tint-slash skyblue\"></i>";
					} else if (!isNaN(forecast.snow)) {
						if(config.units !== "imperial") {
							rainCell.innerHTML = parseFloat(forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-snowflake-cold lightblue\"></i>";
						} else {
							rainCell.innerHTML = (parseFloat(forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-snowflake-cold lightblue\"></i>";
						}
					} else {
						if (config.units !== "imperial") {
							rainCell.innerHTML = parseFloat(forecast.rain).toFixed(1).replace(".", this.config.decimalSymbol) + " mm &nbsp;<i class=\"fa fa-tint skyblue\"></i>&nbsp;";
						} else {
							rainCell.innerHTML = (parseFloat(forecast.rain) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in &nbsp;<i class=\"fa fa-tint skyblue\"></i>&nbsp;";
						}
					} 
					rainCell.className = "align-right bright rain";
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

				if (this.config.extra) {
					var row = document.createElement("tr");
					if (!this.config.colored) {
						row.className = "grayscale extra";
					} else {
						row.className = "extra";
					}
					table.appendChild(row);

					var humidity = document.createElement("td");
					humidity.innerHTML = "<i class=\"wi wi-humidity skyblue little\"></i> " + parseFloat(forecast.humidity).toFixed(0).replace(".", this.config.decimalSymbol) + "%";
					humidity.className = "align-left humidity";
					row.appendChild(humidity);

					var dewPoint = document.createElement("td");
					dewPoint.innerHTML = parseFloat(forecast.dewPoint).toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
					dewPoint.className = "dewPoint skyblue";
					row.appendChild(dewPoint);

					var pressure = document.createElement("td");
					pressure.innerHTML = Math.round(forecast.pressure * 750.062 / 1000).toFixed(0).replace(".", this.config.decimalSymbol) + " <span class=dimmed>Hg</span>";
					pressure.className = "pressure greenyellow";
					row.appendChild(pressure);

					var uvIndex = document.createElement("td");
					uvIndex.innerHTML = "<i class=\"wi wi-hot gold little\"></i> " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
					uvIndex.className = "uvIndex";
					row.appendChild(uvIndex);

					if (this.config.showRainAmount) {
						var precip = document.createElement("td");
						precip.innerHTML =  parseFloat(forecast.precip).toFixed(2).replace(".", this.config.decimalSymbol) + "% <i class=\"wi wi-umbrella lime\"></i>";
						precip.className = "precipitation";
						row.appendChild(precip);
					}
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

		var url = this.config.apiBase + this.config.apiVersion + this.config.weatherEndpoint + this.getParams();
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
				//	if (self.config.endpointType === "daily") {
				//		self.config.endpointType = "hourly";
				//		Log.warn(self.name + ": Incorrect APPID.");
				//	}
					retry = true;
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
			params += "&exclude=minutely,hourly,daily,alerts";
		}
		else if (this.config.endpointType === "hourly") {
			params += "&exclude=current,minutely,daily,alerts";
		}
		else if (this.config.endpointType === "daily") {
			params += "&exclude=current,minutely,hourly,alerts";
		}
		else if (this.config.endpointType === "alerts") {
			params += "&exclude=current,minutely,hourly,daily";
		}
		else {
			params += "&exclude=minutely";
		}

		return params;
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
	processWeather: function (data) {
		if (!data || !data.current || typeof data.current.temp === "undefined") {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

		this.humidity = parseFloat(data.current.humidity);
		this.temperature = this.roundValue(data.current.temp);
		this.feelsLike = 0;
		this.desc = data.current.weather[0].description;	// weather description.
		this.pressure = data.current.pressure;				// main pressure.
		this.visibility = data.current.visibility;			// visibility.
		this.dew = data.current.dew_point;					// dew point.
		this.uvi = data.current.uvi;						// uv index.

		this.temperature === "-0.0" ? 0.0 : this.temperature;

		var precip = false;
		if (!data.current.hasOwnProperty("rain") && !data.current.hasOwnProperty("snow")) {
			this.precipitation = 0;
			precip = false;
		}
		if (data.current.hasOwnProperty("rain") && !data.current.hasOwnProperty("snow")) {
			this.rain = data.current["rain"]["1h"];
			precip = true;
		}
		if (data.current.hasOwnProperty("snow") && !data.current.hasOwnProperty("rain")) {
			this.snow = data.current["snow"]["1h"];
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
			Log.error("Unexpected forecast data");
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
					dewPoint: this.roundValue(forecast.dew_point),
					uvIndex: forecast.uvi,
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
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function () {
			self.updateWeather();
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
		if (!isNaN(forecast.rain)) {
			return forecast.rain;
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

		if (!isNaN(forecast.snow)) {
			return forecast.snow;
		}

		//Find all forecasts that is for the same day
		var checkDateTime = forecast.dt_txt ? mom(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(forecast.dt, "X");
		var daysForecasts = allForecasts.filter(function (item) {
			var itemDateTime = item.dt_txt ? mom(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(item.dt, "X");
			return itemDateTime.isSame(checkDateTime, "day") && item.snow instanceof Object;
		});

		//If no rain this day return undefined so it wont be displayed for this day
		if (daysForecasts.length === 0) {
			return undefined;
		}

		//Summarize all the rain from the matching days
		return daysForecasts
			.map(function (item) {
				return Object.values(item.snow)[0];
			})
			.reduce(function (a, b) {
				return a + b;
			}, 0);
	}
});