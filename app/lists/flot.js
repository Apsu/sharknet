function(head, req) {
    var series = {}, row, entry;
    while(row = getRow()) {
        entry = [Date.UTC.apply(this, [row.key[2], row.key[3]-1].concat(row.key.slice(4))), row.value];
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

    var data = [], item, count = 0;
    for(item in series) {
        if(count < 20){
            count++;
        }
        else{
            break;
        }
        data.push({"label": item, "data": series[item]});
    }
    
    send(toJSON(data));
}