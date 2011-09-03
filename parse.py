#!/usr/bin/env python

try:
    import json # Try newer library first
except ImportError:
    import simplejson # Try older next, bomb if not found

from sys import stdin

def parse_block(handle):
    block_type = handle.readline().strip()
    filter_type = handle.readline().strip().replace('<No Filter>', '').replace('Filter:', '')
    block = [filter_type] # Block starts with filter string

    handle.readline() # Skip empty line

    if 'Conversations' in block_type:
        handle.readline() # Skip headers
    
    for line in handle:
        if line[0] == '=': # End of block
            return (block_type, block) # Tuple for dict

        stats = line.split() # Initial division
        
        # Block-specific cleanup
        if 'Conversations' in block_type:
            stats.remove('<->')
            stats[0] = stats[0].split(':')
            stats[1] = stats[1].split(':')
        elif block_type == 'Protocol Hierarchy Statistics':
            stats[1] = stats[1].split(':')[1]
            stats[2] = stats[2].split(':')[1]
            
        block.append(stats) # Add to block

# Start of program
if __name__ == '__main__':
    #stdin = open(0, 'r') # Get a handle to stdin
    blocks = {} # Initialize stat blocks
    
    for line in stdin:
        if(line[0] == '='): # Start of block
            blocks.update([parse_block(stdin)]) # Indexed by block_type
        else:
            pass # Ignore anything else
    
    print(json.dumps(blocks))
