function(keys, values, rereduce) {
    return parseInt(sum(values) / values.length);
}