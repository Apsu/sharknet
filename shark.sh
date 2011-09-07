#!/bin/sh

tshark -i $1 -qnpa duration:$2 -z conv,tcp 2>/dev/null | ./parse.py $2