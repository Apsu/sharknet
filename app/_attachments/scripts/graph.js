function graph () {
    var flot_options = {
        lines: { show: true },
        points: { show: true },
        xaxis: { mode: "time" } //, timeformat: "%y/%m/%d %H:%M:%S" }
    };
    
    var flot_data = [{label: "10.0.0.1", data: []}];

    var placeholder = $("#placeholder");
    var auth = {
        name: "admin",
        password: "admin"
    };

    //$.couch.urlPrefix = "http://localhost:5984";
    $.couch.login(auth);    
    $db = $.couch.db("db");

    $db.view("sharknet/by-dest-ip-total", {
        success: function(data) {
            for (i in data.rows) {
                //$("div#placeholder").append(data.rows[i].key + "&nbsp;&nbsp;");
                //$("div#placeholder").append(data.rows[i].value + "<br>");
                flot_data[0]["data"].push([Date.UTC.apply(this, data.rows[i].key.slice(2,9)), data.rows[i].value]);
            }
            console.log(flot_data);
            $.plot(placeholder, flot_data, flot_options);
        },
        stale: "update_after",
        group: true,
        group_level: 8,
        startkey: ["loki", "10.0.0.1"],
        endkey: ["loki", "10.0.0.75", []]
    });

    //setTimeout(fetchData, 1000);
};