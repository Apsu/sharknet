function(doc) {
    if (doc.type && doc.type == "TCP Conversations") {
	for (var e in doc.events) {
	    emit([doc.timestamp, doc.events[e].dest_ip], doc.events[e].bytes_in);
	}
    }
}