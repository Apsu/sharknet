function graph () {
    var options = {
        lines: { show: true },
        points: { show: true },
        xaxis: { mode: "time", timeformat: "%y/%m/%d" }
    };

    var placeholder = $("#placeholder");
    var auth = {
        name: "admin",
        password: "admin"
    };

    //$.couch.urlPrefix = "http://localhost:5984";
    $.couch.login(auth);    
    $db = $.couch.db("db");

    $db.view("sharknet/by-dest-port-total", {
        success: function(data) {
            for (i in data.rows) {
                $("div#placeholder").append(data.rows[i].key + "&nbsp;&nbsp;");
                $("div#placeholder").append(data.rows[i].value + "<br>");
            }
        },
        stale: "update_after",
        group: true,
        group_level: 7,
        startkey: ["loki"],
        endkey: ["loki", []]
    });

    //$.plot(placeholder, merge, options);
    //setTimeout(fetchData, 1000);
};