#!/bin/sh

# TODO: Make -z conv,tcp,$3 add ',' if $3 exists
tshark -i $1 -qnpa duration:$2 -z conv,tcp 2>/dev/null | ./parse.py $2