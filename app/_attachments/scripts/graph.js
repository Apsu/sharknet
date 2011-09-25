function graph () {
    function byteFormatter(val, axis) {
        var giga = Math.pow(10,9), mega = Math.pow(10,6), kilo = Math.pow(10,3);
        if (val > giga)
            return (val / giga).toFixed(2) + "GB";
        else if (val > mega)
            return (val / mega).toFixed(2) + "MB";
        else if (val > kilo)
            return (val / kilo).toFixed(2) + "kB";
        else
            return val.toFixed(false) + "B";
    };

    var flot_options = {
        series: {
            shadowSize: 0,
            lines: { show: true, fill: true, lineWidth: 2 },
            points: { show: true, fill: false }
        },
        grid: { hoverable: true, mouseActiveRadius: 50},
        yaxis: { tickFormatter: byteFormatter },
        xaxis: { mode: "time"}, // timeformat: "%h:%M" },
        zoom: { interactive: true, amount: 1.5 },
        pan: { interactive: true },
        interaction: { redrawOverlayInterval: -1 }
    };
    
    var plot, flot_data, placeholder = $("#placeholder");
    var auth = {
        name: "admin",
        password: "admin"
    };

    //$.couch.urlPrefix = "http://localhost:5984";
    $.couch.login(auth);    
    $db = $.couch.db("db");

    $db.list("sharknet/flot", "erlang", {
        //limit: 100000,
        group: true,
        group_level: 7
        //stale: "update_after"
        //startkey: ["loki", "10.0.0.1"],
        //endkey: ["loki", "10.0.0.75", []]
    },
             {
                 success: function(data) {
                     flot_data = data['series'];
                     plot = $.plot(placeholder, flot_data, flot_options);
                 },
                 error: function(status) {
                     console.log(status);
                 },
             });
/*
    $.getJSON('data.js', function(data) {
        $.plot(placeholder, data, flot_options);
    });
*/
    $("#clearSelection").click(function () {
        plot.clearSelection();
        plot = $.plot(placeholder, flot_data, flot_options);
    });

    function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5,
            border: '1px solid #fdd',
            padding: '2px',
            color: '#fff',
            'background-color': '#000',
            opacity: 0.70
        }).appendTo("body").fadeIn(100);
    }

    placeholder.bind("plothover", function (event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));
        
        if (item) {
            if (previousPoint != item.dataIndex) {
                previousPoint = item.dataIndex;
                
                $("#tooltip").remove();
                var x = item.datapoint[0],
                y = item.datapoint[1];
                
                showTooltip(item.pageX, item.pageY,
                            function() {
                                var d = new Date; 
                                d.setTime(x);
                                return d.getUTCFullYear() + "/" +
                                    (d.getUTCMonth()+1) + "/" +
                                    d.getUTCDate() + ", " +
                                    d.getUTCHours() + ":" +
                                    d.getUTCMinutes() + " -- Port: " +
                                    item.series.label + " = " + byteFormatter(y);
                            }());
            }
        }
        else {
            $("#tooltip").remove();
            previousPoint = null;            
        }

    });
};