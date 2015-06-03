var React = require('react');
var JQuery = require('jquery');
var d3 = require('d3');
var Constants = require('../Constants');

/**
 * Encapsulates the course detail screen
 */
var LinePlotComponent = React.createClass({

    getTimeSeries : function() {
        /* TODO Vi + Emily
        1) have the values on the x axis be spaced out better
        2) Display only top X professors/courses

        Notes:
        1) The css for the d3 stuff is in fp-vjampala-emilygu-drapeau/frontend/static/css/time-series.css .
        2) The main index.html file is in fp-vjampala-emilygu-drapeau/frontend/static/index.html .
        You probably won't need to edit it.
        3) The json Ryan created uses "datetime" instead of time.
        */

        JQuery("#" + this.props.divId).empty();
        if (this.props.current_courses.length === 0) {
            return;
        }

        function modifyData(data, key) {
            var newData = []
            var existingData = {}

            // Merge averages
            for(var i = 0; i < data.length; i++) {
                var dataPoint = data[i];
                var rating = dataPoint.the_course_as_a_whole;
                var prevCount = 0;

                // To use as key
                dataPointString = JSON.stringify({"datetime": dataPoint["datetime"], "name": dataPoint[key]});

                // Rating already exists.  So keep track that this is a duplicate
                if (dataPointString in existingData) {
                    var prevRating = existingData[dataPointString];
                    rating = prevRating["sum"] + rating;
                    prevCount = prevRating["count"];
                }

                // Updated stored rating for a class
                existingData[dataPointString] = {"sum": rating, "count": prevCount + 1};
            }

            // Set to previous format
            for (var attribute in existingData) {
                if( existingData.hasOwnProperty(attribute) ) {
                    var course = JSON.parse(attribute);
                    var rating = existingData[attribute];
                    course["the_course_as_a_whole"] = parseFloat((rating["sum"] / rating["count"]).toFixed(2));
                    newData.push(course);
                }
            }

            return newData;
        }

        var data = d3.nest()
            .key(function(d) {
                return d.name;
            })
            .entries(modifyData(this.props.current_courses, this.props.detailKey));

        var margin = {
            top: 20,
            right: 80,
            bottom: 30,
            left: 50
        },
        width = 660 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([0, width - 100]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category10();

        var xAxis = d3.svg.axis()
           .scale(x)
           .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function (d) {
                return x(d.datetime);
            })
            .y(function (d) {
            return y(d.the_course_as_a_whole);
        });

        var svg = d3.select("#" + this.props.divId).append("svg")
            .attr("class", "plot")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // TODO: USES OUTSIDE CODE ------------- DON"T FORGET TO CITE
        // Used for hovering to get rating of professor/course code
        var detailKey = this.props.detailKey;
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return d.name.concat(": ").concat(d.the_course_as_a_whole);
            })

        svg.call(tip);

        color.domain(data.map(function (d) { return d.key; }));

        var timeValues = [];
        data.forEach(function (kv) {
            kv.values.forEach(function (d) {
                d.datetime = d.datetime;
                timeValues.push(d.datetime);
            });
        });

        var cities = data;

        var minX = d3.min(data, function (kv) { return d3.min(kv.values, function (d) { return d.datetime; }) });
        var maxX = d3.max(data, function (kv) { return d3.max(kv.values, function (d) { return d.datetime; }) });
        var minY = d3.min(data, function (kv) { return d3.min(kv.values, function (d) { return d.the_course_as_a_whole; }) });
        var maxY = d3.max(data, function (kv) { return d3.max(kv.values, function (d) { return d.the_course_as_a_whole; }) });

        // Set axis ranges
        x.domain([minX - 0.5, maxX]);
        y.domain([0, 5]);

        function getPrettyTime(time) {
            var quarterNum = time.substr(time.length - 1);
            var quarterStr = "str";
            if (quarterNum === "0") {
                quarterStr = "Wi";
            } else if (quarterNum === "1") {
                quarterStr = "Sp";
            } else if (quarterNum === "2") {
                quarterStr = "Su";
            } else {
                quarterStr = "Au";
            }
            return quarterStr.concat(time.substring(0, time.length - 1));
        }

        timeValues = d3.set(timeValues).values();
        xAxis.tickValues(timeValues);
        xAxis.tickFormat(function(d) { return getPrettyTime(d); })

        // Set y-axis tick marks
        yAxis.tickValues([0, 1, 2, 3, 4, 5]);
        yAxis.tickFormat(d3.format(".0f"));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the text label for the x axis
        svg.append("text")
            .attr("transform", "translate(" + ((width - 100)/ 2) + " ," + (height + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("y",0)
            .attr("dx", "1em")
            .attr("font-size", "14px")
            .attr("fill", "#7f8c8d")
            .text("Quarter");


        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 8 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#7f8c8d")
            .text("Overall Rating");

        var category = svg.selectAll(".category")
            .data(cities)
            .enter().append("g")
            .attr("class", "category");

        category.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
            return line(d.values);
        })
            .style("stroke", function (d) {
            return color(d.key);
        });

        // Draws circle points on lines
        // Includes hovering
        svg.selectAll('g.dot')
            .data(data)
            .enter().append("g")
            .attr("class", "dot")
            .selectAll("circle")
            .data(function(d) {
                return d.values;
            })
            .enter().append('circle')
            .attr("cx", function(d, i) {
                return x(d.datetime);
            })
            .attr("cy", function(d, i) {
                return y(d.the_course_as_a_whole);
            })
            .attr('r', 3)
            .style("fill", "white");

        // Add underlying circle for larger hover area
        svg.selectAll('g.largeDot')
            .data(data)
            .enter().append("g")
            .attr("class", "largeDot")
            .selectAll("circle")
            .data(function(d) {
                return d.values;
            })
            .enter().append('circle')
            .attr("cx", function(d, i) {
                return x(d.datetime);
            })
            .attr("cy", function(d, i) {
                return y(d.the_course_as_a_whole);
            })
            .attr('r', 6)
            .style("opacity", 0)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        // Sets color of circles to match line
        svg.selectAll('circle')
        .style("stroke", function (d) {
            return color(d.name);
        });

        category.append('rect')
            .attr('x', width - 20 + 50 - 100)
            .attr('y', function(d, i){ return i *  20;})
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function(d) {
              return color(d.key);
            });

        category.append('text')
            .attr('x', width - 8 + 50 + 5 - 100)
            .attr('y', function(d, i){ return (i *  20) + 9;})
            .text(function(d){ return d.key; });
    },

    /**
     * Render the page
     */
    render: function() {
        this.getTimeSeries();

        return (
            <div id={this.props.divId} className="time-series-body"></div>
        );
    }
});

module.exports = LinePlotComponent;
