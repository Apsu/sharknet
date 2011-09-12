function graph () {
    var flot_options = {
        lines: { show: true },
        points: { show: true },
        xaxis: { mode: "time" } //, timeformat: "%y/%m/%d %H:%M:%S" }
    };
    
    var flot_data = [];
    var placeholder = $("#placeholder");
    var auth = {
        name: "admin",
        password: "admin"
    };

    //$.couch.urlPrefix = "http://localhost:5984";
    $.couch.login(auth);    
    $db = $.couch.db("db");

    $db.list("sharknet/flot", "by-dest-ip-total", {
        success: function(data) {
            console.log(data);
        },
        error: function(status) {
            console.log(status);
        },
        limit: 10,
        group: true
        //group_level: 8,
        //stale: "update_after",
        //startkey: ["loki", "10.0.0.1"],
        //endkey: ["loki", "10.0.0.75", []]
    });

    //setTimeout(fetchData, 1000);
};