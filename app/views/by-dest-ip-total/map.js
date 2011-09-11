function(doc) {
    if (doc.type && doc.type == "TCP Conversations") {
	    for (var e in doc.events) {
	        emit([doc.hostname].concat(doc.events[e].dest_ip, doc.timestamp), parseInt(doc.events[e].bytes_total / doc.duration));
	}
    }
}