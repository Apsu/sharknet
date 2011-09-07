function(doc) {
    if (doc.type && doc.type == "TCP Conversations") {
	for (var e in doc.events) {
	    emit(doc.hostname.concat(["", doc.timestamp, doc.events[e].dest_port]), doc.events[e].bytes_in);
	}
    }
}