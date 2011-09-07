function(doc) {
    if (doc.type && doc.type == "TCP Conversations") {
	for (var e in doc.events) {
	    emit([doc.hostname].concat(doc.timestamp, doc.events[e].source_ip, doc.events[e].dest_ip), parseInt(doc.events[e].bytes_in / doc.duration);
	}
    }
}