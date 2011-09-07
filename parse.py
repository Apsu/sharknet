#!/usr/bin/env python2

import platform

from couchdb import Server
from couchdb.mapping import datetime

def parse_tcp_conversations(block_type, handle, args):
    filter_type = handle.next().strip().replace('<No Filter>', '').replace('Filter:', '')
    block = {'type': block_type,
             'filter': filter_type,
             'hostname': platform.node(),
             'duration': long(args[1]),
             'timestamp': datetime.utcnow().utctimetuple()[0:6],
             'events': []}
    events = ['source_ip',
              'source_port',
              'dest_ip',
              'dest_port',
              'frames_in',
              'bytes_in',
              'frames_out',
              'bytes_out',
              'frames_total',
              'bytes_total']

    handle.next() # Skip empty line
    handle.next() # Skip headers

    for line in handle:
        if line[0] == '=': # End of block
            return block

        stats = line.split() # Initial division
        stats.remove('<->') # Decruft
        stats = sum(map(lambda(x): x.split(':'), stats), []) # Split and flatten
        stats = map(lambda(x): x.isdigit() and long(x) or x, stats) # Convert numbers
        #stats[5:9] = map(lambda(x): long(x / duration), stats[5:9]) # Get average
        block['events'].append(dict(zip(events, stats))) # Zip to dict and append

def dispatch(handle, db, args):
    block_type = handle.next().strip()
    if 'TCP' in block_type: # TCP Conversations
        block = parse_tcp_conversations(block_type, handle, args)
        db.create(block) # Add block to DB
        #print(block)
        
# Start of program
if __name__ == '__main__':
    from sys import stdin, argv

    couch = Server('http://localhost:5984')
    couch.resource.http.add_credentials('admin', 'admin') # Admin partay!
    try: db = couch['db'] # Get DB if it exists
    except: db = couch.create('db') # Create otherwise

    for line in stdin:
        if(line[0] == '='): # Start of block
            dispatch(stdin, db, argv)
        else:
            pass # Ignore anything else
