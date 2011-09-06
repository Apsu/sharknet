function(doc) {
    if (doc.type && doc.type == "TCP Conversations") {
	for (var e in doc.events) {
	    emit(doc.timestamp.concat([doc.events[e].source_ip, doc.events[e].dest_ip]), doc.events[e].bytes_in);
	}
    }
}