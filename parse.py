#!/usr/bin/env python2

from sys import stdin

from couchdb import Server
from couchdb.mapping import datetime

def parse_tcp_conversations(block_type):
    filter_type = stdin.next().strip().replace('<No Filter>', '').replace('Filter:', '')
    block = {'type': block_type, 'filter': filter_type, 'timestamp': datetime.utcnow().utctimetuple()[0:6], 'events': []}
    events = ['source_ip', 'source_port', 'dest_ip', 'dest_port', 'frames_in', 'bytes_in', 'frames_out', 'bytes_out', 'frames_total', 'bytes_total']

    stdin.next() # Skip empty line
    stdin.next() # Skip headers

    for line in stdin:
        if line[0] == '=': # End of block
            return block

        stats = sum([item.split(':') for item in line.split()], []) # Split and flatten
        stats.remove('<->')
        for i in range(len(stats)):
            try: stats[i] = long(stats[i])
            except ValueError: pass

        block['events'].append(dict(zip(events, stats)))

# Start of program
if __name__ == '__main__':
    couch = Server('http://localhost:5984')
    couch.resource.http.add_credentials('admin', 'admin') # Admin partay!
    try: db = couch['db'] # Get DB if it exists
    except: db = couch.create('db') # Create otherwise

    for line in stdin:
        if(line[0] == '='): # Start of block
            block_type = stdin.next().strip()
            if 'TCP' in block_type: # TCP Conversations
                block = parse_tcp_conversations(block_type)
                db.create(block) # Add block to DB
        else:
            pass # Ignore anything else
