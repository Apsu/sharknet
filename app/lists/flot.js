function(head, req) {
    var series = {}, row, entry;
    while(row = getRow()) {
        entry = [Date.UTC.apply(this, row.key.slice(2,9)), row.value];
        if(series[row.key[1]]) {
            series[row.key[1]].push(entry);
        }
        else {
            series[row.key[1]] = [entry];
        }
    }
    
    start({
        "headers": {
            "Content-Type": "application/json"
        }
    });

    var data = [], item;
    for(item in series) {
        data.push([{"label": item, "data": series[item]}]);
    }
    
    send(toJSON(data));
}