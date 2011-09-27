function graph () {
    var flot_data, previousPoint;

    var auth = {
        name: "admin",
        password: "admin"
    };

    var flot_opts = {
        series: {
            shadowSize: 0,
            lines: { show: true, fill: true, lineWidth: 2 },
            points: { show: true, fill: false }
        },
        grid: { hoverable: true, mouseActiveRadius: 50},
        yaxis: { tickFormatter: byteFormatter },
        xaxis: { mode: "time"},
        zoom: { interactive: true, amount: 1.5 },
        pan: { interactive: true },
        interaction: { redrawOverlayInterval: -1 }
    };
    
    // Set default options
    var list_opts = {
	group: true,
	stale: "update_after"
    };

    var list_funcs = {
        success: function(data) {
            flot_data = data; // Make accessible globally
            $.plot($("#placeholder"), flot_data, flot_opts);
        },
        error: function(status) {
            console.log(status);
        }
    };

    function byteFormatter(val, axis) {
        var giga = Math.pow(10, 9), mega = Math.pow(10, 6), kilo = Math.pow(10, 3);

        if (Math.abs(val) > giga)
            return (val / giga).toFixed(2) + "GB";
        else if (Math.abs(val) > mega)
            return (val / mega).toFixed(2) + "MB";
        else if (Math.abs(val) > kilo)
            return (val / kilo).toFixed(2) + "kB";
        else
            return val.toFixed(false) + "B";
    };

    function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + "</div>").css({
            position: "absolute",
            display: "none",
            top: y + 5,
            left: x + 5,
            border: "1px solid #fdd",
            padding: "2px",
            color: "#fff",
            "background-color": "#000",
            opacity: 0.70
        }).appendTo("body").fadeIn(100);
    };

    function hoverFunc(event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));

        if (item) {
            if (previousPoint != item.dataIndex) {
                previousPoint = item.dataIndex;

                $("#tooltip").remove();
                var x = item.datapoint[0],
                y = item.datapoint[1];

                showTooltip(item.pageX, item.pageY, function() {
                    var d = new Date;

                    d.setTime(x);
                    return d.format("UTC:m/d/yyyy, HH:MM") + " -- Port: " + item.series.label + " = " + byteFormatter(y);
                }());
            }
        }
        else {
            $("#tooltip").remove();
            previousPoint = null;            
        }
    };

    $(function() {
	var dates = $( "#from, #to" ).datepicker({
	    defaultDate: "+1d",
	    changeMonth: true,
	    numberOfMonths: 1,
	    onSelect: function( selectedDate ) {
		var option = this.id == "from" ? "minDate" : "maxDate",
		instance = $( this ).data( "datepicker" ),
		date = $.datepicker.parseDate(
		    instance.settings.dateFormat ||
			$.datepicker._defaults.dateFormat,
		    selectedDate, instance.settings );
		dates.not( this ).datepicker( "option", option, date );
	    }
	});
    });

    function update() {
	$db.list("sharknet/flot", "by-port", list_opts, list_funcs);
        $.plot($("#placeholder"), flot_data, flot_opts);
    };

    $("#year").click(function() {
	//list_opts["startkey"] = [ ];
	list_opts["endkey"] = [[]];
	list_opts["group_level"] = 3;
	flot_opts["xaxis"]["timeformat"] = "%y";
	//flot_opts["xaxis"]["minTickSize"] = [10, "year"];
	update();
    });

    $("#month").click(function() {
	//list_opts["startkey"] = [ ];
	list_opts["endkey"] = [[]];
	list_opts["group_level"] = 4;
	flot_opts["xaxis"]["timeformat"] = "%m/%y";
	flot_opts["xaxis"]["minTickSize"] = [1, "month"];
	update();
    });

    $("#day").click(function() {
	//list_opts["startkey"] = [ ];
	list_opts["endkey"] = [[]];
	list_opts["group_level"] = 5;
	flot_opts["xaxis"]["timeformat"] = "%m/%d/%y";
	flot_opts["xaxis"]["minTickSize"] = [1, "day"];
	update();
    });

    $("#hour").click(function() {
	//list_opts["startkey"] = [ ];
	list_opts["endkey"] = [[]];
	list_opts["group_level"] = 6;
	flot_opts["xaxis"]["timeformat"] = "%m/%d %H:%M";
	flot_opts["xaxis"]["minTickSize"] = [1, "hour"];
	update();
    });
    
    $("#minute").click(function() {
	//list_opts["startkey"] = [ ];
	list_opts["endkey"] = [[]];
	list_opts["group_level"] = 7;
	flot_opts["xaxis"]["timeformat"] = "%H:%M";
	flot_opts["xaxis"]["minTickSize"] = [1, "minute"];
	update();
    });

    /* CODE STARTS HERE LOL */
    $("#from, #to").val(dateFormat(Date(), "UTC:m/d/yyyy"));

    $("#placeholder").bind("plothover", hoverFunc);

    $.couch.urlPrefix = "http://localhost:5984";
    $.couch.login(auth);    
    $db = $.couch.db("db");

    $("#year").click();
};