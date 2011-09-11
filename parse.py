#!/usr/bin/env python2

import platform

from couchdb import Server
from couchdb.mapping import datetime

def parse_tcp(block_type, handle, args):
    filter_type = handle.next().strip().replace('<No Filter>', '').replace('Filter:', '')

    block = {'type': block_type,
             'filter': filter_type,
             'hostname': platform.node(),
             'interface': args[1],
             'duration': long(args[2]),
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
        block['events'].append(dict(zip(events, stats))) # Zip to dict and append

def dispatch(handle, db, args):
    block_type = handle.next().strip()
    if 'TCP' in block_type: # TCP Conversations
        block = parse_tcp(block_type, handle, args)
        if len(block['events']) > 0:
            db.create(block) # Add block to DB
            #print block
        
# Start of program
if __name__ == '__main__':
    from sys import stdin, argv

    if not len(argv) == 3 or not argv[1].isalnum() or not argv[2].isdigit():
        print 'Usage: Parse <interface> <seconds>'
        print '  <interface>  Name of capture interface'
        print '  <seconds>    Duration of samples in seconds'
        exit()

    couch = Server('http://localhost:5984')
    couch.resource.http.add_credentials('admin', 'admin') # Admin partay!
    try: db = couch['db'] # Get DB if it exists
    except: db = couch.create('db') # Create otherwise

    for line in stdin:
        if line[0] == '=': # Start of block
            dispatch(stdin, db, argv)
        else:
            print 'Invalid input line:'
            print line
