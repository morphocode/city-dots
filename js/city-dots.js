// namespace
var citydots = {};

(function() {
    'use strict';

    // public functions
    citydots.bootstrap = bootstrap;


    // the list of cities that are currently supported
    var cities = {
            'bangalore': {
                label: 'Bangalore'
            },
            'boston': {
                label: 'Boston'
            },
            'geneva': {
                label: 'Geneve'
            },
            'rio': {
                label: 'Rio de Janeiro'
            },
            'san-francisco': {
                label: 'San Francisco'
            },
            'shanghai': {
                label: 'Shanghai'
            },
            'singapore': {
                label: 'Singapore'
            }
        },

        // settings shared by all calendars
        standardCalSettings = {
            domain : 'day',
            domainGutter: 0, // controls the spacing between different days
            domainLabelFormat: '%e %b',
            colLimit: 4, // how many rows
            label: {
                align: 'center',
                position: 'bottom',
                width: 46
            },
            subDomain : 'x_hour',
            /*subDomainTextFormat: "%H",/*function(date ,value) {
                //return value;
                return '%e';
            },*/
            subDomainTitleFormat: {
                empty: 'No data',
                filled: '{count} {name} at {date}'
            },
            subDomainDateFormat: '%H h',
            cellSize: 16,
            cellRadius: 8,
            verticalOrientation: true,
            tooltip: true,
            displayLegend: false
        },

        // Settings for each of the Metrics: legend, unit type, color scale
        metrics = {
            'dust': {
                legend: [700, 1100, 1500, 1900, 2300, 2700, 3100],
                itemName: ['pcs/liter', 'pcs/liter'],
                legendTitle: 'Dust',
                legendDescription: {
                    'q1': '&lt; 700 pcs/liter',
                    'q2': '700 — 1100 pcs/liter',
                    'q3': '1100 — 1500 pcs/liter',
                    'q4': '1500 — 1900 pcs/liter',
                    'q5': '1900 — 2300 pcs/liter',
                    'q6': '2300 — 2700 pcs/liter',
                    'q7': '2700 — 3100 pcs/liter',
                    'q8': '&gt; 3100 pcs/liter'
                }
            },
            'humidity': {
                legend: [20.0, 30.0, 40.0, 50.0, 60.0, 70.0],
                itemName: ['%', '%'],
                legendTitle: 'Humidity',
                legendDescription: {
                    'q1': '&lt; 20 %',
                    "q2": "20 % — 30 %",
                    "q3": "30 % — 40 %",
                    "q4": "40 % — 50 %",
                    "q5": "50 % — 60 %",
                    "q6": "60 % — 70 %",
                    "q7": "&gt; 70 %"
                }
            },
            'light': {
                legend: [1.5, 100.0, 800.0, 1000, 2000.0, 3000.0],
                itemName: ['Lux', 'Lux'],
                legendTitle: 'Light',
                legendDescription: {
                    "q1": "Night sky",
                    "q2": "Sunrise / Sunset",
                    "q3": "Cloudy",
                    "q4": "Overcast day",
                    "q5": "Full daylight",
                    "q6": "Direct sunlight"
                }
            },
            'sound': {
                legend: [1200.0, 1350.0, 1500.0, 1650.0, 1800.0],
                itemName: ["mV", "mV"],
                legendTitle: 'Noise',
                legendDescription: {
                    "q1": "&lt; 1200 mV",
                    "q2": "1200 mV — 1350 mV",
                    "q3": "1350 mV — 1500 mV",
                    "q4": "1500 mV — 1650 mV",
                    "q5": "1650 mV — 1800 mV",
                    "q6": "&gt; 1800 mV"
                }
            },
            'temperature': {
                legend: [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0],
                itemName: ["°C", "°C"],
                legendTitle: 'Temperature',
                legendDescription: {
                    "q1": "&lt; 0 °C",
                    "q2": "0 °C — 5 °C",
                    "q3": "5 °C — 10 °C",
                    "q4": "10 °C — 15 °C",
                    "q5": "15 °C — 20 °C",
                    "q6": "20 °C — 25 °C",
                    "q7": "25 °C — 30 °C",
                    "q8": "30 °C — 35 °C",
                    "q9": "&gt; 35 °C"
                }
            }
        },

        calendars = {};


    /*
     * Initialized the application.
     * Builds the UI and sets the default metrics.
     */
    function bootstrap() {

        currentCity('all');
        currentMetric('dust');
        currentDate(2015, 2);
        currentVizType('all-cities');
        initCalendars('dust', 2015, 2);

        $(".metrics li").click(function(event) {
            var thisMetric = $(this).data('metric');
            currentMetric(thisMetric);

            updateCalendars();
        });

        $(".dates li").click(function(event) {
            var _year = $(this).data('year'),
                _month = $(this).data('month');
            currentDate(_year, _month);

            updateCalendars();
        });

        $(".cities li").click(function(event) {
            var _city = $(this).data('city');
            currentCity(_city);

            updateCalendars();
        });
    }


    /**
     * Builds a Calendar for each of the cities
     */
    function initCalendars(metric, year, month) {
        var month = month || 2,
            year = year || 2015,
            counter = 0,
            vizType = currentVizType();

        // hide calendars
        $('.cal-wrapper').toggleClass('has-data', false);

        switch (vizType) {
            case 'all-cities':
                for (var city in cities) {
                    initCalendar('cal-'+counter, city, metric, year, month);
                    counter++;
                }
                break;

            // one city, one metric, multiple months
            case 'single-city':
                var dates = [
                    {year: 2015, month: 1},
                    {year: 2015, month: 2},
                    {year: 2015, month: 3}
                ];
                for (var i = 0; i < dates.length; i++) {
                    var date = dates[i];
                    initCalendar('cal-'+counter, currentCity(), metric, date.year, date.month);
                    counter++;
                }
                break;

            // one city, all metrics for one month
            case 'single-city-all':
                for (var metric in metrics) {
                    initCalendar('cal-'+counter, currentCity(), metric, year, month);
                    counter++;
                }
                break;

            default:
                throw new Error('Unsupported visualization type: ' + vizType);
        }

        // update the colors legend and the dates in the side panel
        updateSidePanel(metric, year, month);

    }

    /**
     * Rebuilds the calendars based on the current metric and date
     */
    function updateCalendars() {
        initCalendars(currentMetric(), currentDate().year, currentDate().month);
    }


    /**
     * Builds a calendar for the specified city, metric and date.
     * Note: we need to rebuild the calendar because the present updateData() of cal-heat doesn't handle range changes well
     */
    function initCalendar(id, city, metric, year, month) {

        var month = month || 2,
            year = year || 2015,
            startDate = moment(year + '-' + month, 'YYYY-M'),
            customSettings = {
                start: startDate.toDate(),
                afterLoadData: buildParser(metric),
                data: 'data/' + startDate.format('YYYY-MM-') + city + '.json',
                itemName: metrics[metric].itemName,
                itemSelector : "#" + id + " .cal-placeholder",
                legend: metrics[metric].legend,
                range: startDate.daysInMonth(),
                afterLoad: function() {
                    calElement.attr('metric', 'none');
                    calElement.attr('city', 'none');
                    calElement.toggleClass('has-data', true);
                },
                onComplete: function() {
                    calElement.attr('metric', metric);
                    calElement.attr('city', city);

                    // reset dimensions
                    $(customSettings.itemSelector).height('');
                    $(customSettings.itemSelector).width('');
                }
            },
            cal = calendars[id],
            calElement = $('.cal-wrapper#'+id);


        // use standard settings for base
        $.extend(customSettings, standardCalSettings);

        // destroy the calendar if existing
        if (cal) {
            var _height = $(customSettings.itemSelector).height(),
                _width = $(customSettings.itemSelector).width();

            cal = cal.destroy();

            // we need to set height and width to prevent page flickering while rebuilding the DOM
            $(customSettings.itemSelector).html('');
            //$(customSettings.itemSelector).height(_height);
            //$(customSettings.itemSelector).width(_width);
        }

        calendars[id] = new CalHeatMap();
        calendars[id].init(customSettings);

        // update the corresponding DOM element
        calElement.find('.primary-label').html(cities[city].label);
        calElement.find('.secondary-label').html(startDate.format('MMM YYYY'));
    }

    /**
     * Updates the side panel by showing the current date and metrics selected
     */
    function updateSidePanel(metric, year, month) {
        // set the active legent element
        $('ul.legend-colors').removeClass('active');
        $('ul.legend-colors[data-metric=' + metric + ']').addClass('active');

        // re-build the legend
        $('.tab-metric-scale .title').html(metrics[metric].legendTitle + ' Scale');
        $('ul.legend-colors').replaceWith(buildLegend(metric));

    }

    /**
     *  Build the colors legend for the current metric
     */
    function buildLegend(metric) {
        var legendHtml = '<ul class="legend-colors" metric="' + metric + '">',
            myMetricLegend = metrics[metric].legendDescription;

        for (var qIndex in myMetricLegend) {
            if (myMetricLegend.hasOwnProperty(qIndex)) {
                legendHtml += '<li><span class="circle ' + qIndex + '"></span> ' + myMetricLegend[qIndex] + '</li>';
            }
        }

        legendHtml += '</ul>';

        return legendHtml;
    }

    // January
    // http://sensor-api.localdata.com/api/v1/aggregations?op=mean&over.city=San%20Francisco&from=2015-01-01T00:00:00-0800&before=2015-01-31T23:59:59-0800&resolution=1h&fields=temperature,humidity,dust,light,airquality_raw,sound

    // http://sensor-api.localdata.com/api/v1/aggregations?op=mean&over.city=Shanghai&from=2015-02-01T00:00:00-0800&before=2015-03-01T00:00:00-0800&resolution=1h&fields=temperature,humidity,dust,light,airquality_raw,sound

    // March
    // http://sensor-api.localdata.com/api/v1/aggregations?op=mean&over.city=Bangalore&from=2015-02-28T00:00:00-0800&before=2015-03-31T23:59:59-0800&resolution=1h&fields=temperature,humidity,dust,light,airquality_raw,sound
    /**
     * Parse the DataCanvas API into the format expected by the Cal-Heat plug-in
     */
    var buildParser = function(metric) {
        // this is the parser function
        return function(data) {
            if (!data) {
                return {};
            }

            var stats = {},
                rawData = data['data'];

            for (var d in rawData) {
                var isoDate = rawData[d].timestamp;
                var utcMoment = moment.utc(isoDate);
                var city = rawData[d].city;

                // since Calendar Heat always shows the dates according to the current timezone,
                // we need to shift the timestamps so that the original time is preserved
                // i.e. when we see 17h - it means 17h local time in San Francisco
                var currentTzOffset = parseInt(moment().format('Z'));
                var dataTimezone = getTimezone(city);
                var dataTzOffset = parseInt(moment().tz(dataTimezone).format('Z'));

                var localMoment = utcMoment.add(dataTzOffset-currentTzOffset, 'hours');
                var timestamp = localMoment.unix();

                //var timestamp = Math.round((new Date(isoDate)).getTime() / 1000);

                var value = rawData[d][metric];
                // if the value is present, cut it to 2 digits after the floating point
                if (value != undefined) {
                    value = parseFloat(value.toFixed(2));
                }
                stats[timestamp] = value;
            }
            //alert('data re-loaded');
            return stats;
        }
    };

    /**
     * http://en.wikipedia.org/wiki/List_of_tz_database_time_zones
     * returns the timezone for the given city
     */
    function getTimezone(city) {
        switch (city) {
            case 'Bangalore':
                return 'Asia/Kolkata';
            case 'Boston':
                return 'America/New_York';
            case 'Geneva':
                return 'Europe/Zurich';
            case 'Rio de Janeiro':
                return 'America/Sao_Paulo';
            case 'San Francisco':
                return 'America/Los_Angeles';
            case 'Shanghai':
                return 'Asia/Shanghai';
            case 'Singapore':
                return 'Asia/Singapore';

            default:
                throw new Error('Cannot determine timezone for city: ' + city);
        }
    }

    /**
     * setter/getter for the current metric
     */
    function currentMetric(metric) {
        if (arguments.length) {
            $('.metrics li').removeClass('active');
            $('.metrics li[data-metric='+metric+']').addClass('active');

            var title = $('ul.metrics li.active a').html();
            $('.menu-metrics .menu-label').html(title);
        } else {
            return $(".metrics li.active").data('metric');
        }
    }

    /**
     * setter/getter for the current date
     */
    function currentDate(year, month) {
        if (arguments.length) {
            $('ul.dates li').removeClass('active');
            $('ul.dates li[data-year='+year+'][data-month='+month+']').addClass('active');

            var title = $('ul.dates li.active a').html();
            $('.menu-dates .menu-label').html(title);
        } else {
            var $activeDate = $('.dates li.active');
            return {
                month: $activeDate.data('month'),
                year: $activeDate.data('year')
            };
        }
    }

    /**
     * setter/getter for the current visualization type
     */
    function currentVizType(vizType) {
        if (arguments.length) {
            //$('.viz-types li[data-viz-type]').removeClass('active');
            //$('.viz-types li[data-viz-type='+vizType+']').addClass('active');
            $('.left-panel-primary').attr('data-viz-type', vizType);
        } else {
            //return $(".viz-types li[data-viz-type].active").data('viz-type');
            return  $('.left-panel-primary').attr('data-viz-type');
        }
    }

    /**
     * setter/getter for the current city
     */
    function currentCity(city) {
        if (arguments.length) {
            $('ul.cities li[data-city]').removeClass('active');
            $('ul.cities li[data-city='+city+']').addClass('active');

            if (city == 'all') {
                currentVizType('all-cities');
            } else {
                currentVizType('single-city');
            }

            var title = $('ul.cities li.active a').html();
            $('.menu-cities .menu-label').html(title);
        } else {
            return $("ul.cities li[data-city].active").data('city');
        }
    }

})();