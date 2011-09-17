#!/bin/zsh
# $1 Rate in packets per s
# $2 Number of CPUs to use
# $3 Number of packets
# $4 Packet size
# $5 Interface to use
# $6 Destination IP
# $7 Destination MAC
function pgset() {
    local result
    echo $1 > $PGDEV
}

# thread config
CPUS=$2
RATEP=`echo "scale=0; $1/$CPUS" | bc`
PKTS=`echo "scale=0; $3/$CPUS" | bc`
CLONE_SKB="clone_skb $3"
PKT_SIZE="pkt_size $4"
COUNT="count $PKTS"
ETH=$5
IP=$6
MAC=$7

for processor in {0..$(($CPUS-1))}
do
PGDEV=/proc/net/pktgen/kpktgend_$processor
#  echo "Removing all devices"
 pgset "rem_device_all"
done

for processor in {0..$(($CPUS-1))}
do
PGDEV=/proc/net/pktgen/kpktgend_$processor
#  echo "Adding $ETH"
 pgset "add_device $ETH@$processor"
 
PGDEV=/proc/net/pktgen/$ETH@$processor
#  echo "Configuring $PGDEV"
 pgset "$COUNT"
 pgset "flag QUEUE_MAP_CPU"
 pgset "$CLONE_SKB"
 pgset "$PKT_SIZE"
 pgset "ratep $RATEP"
 pgset "dst $IP" 
 pgset "dst_mac $MAC"
 #pgset "flows 1024"
 #pgset "flowlen 8"
done

# Time to run
PGDEV=/proc/net/pktgen/pgctrl

 echo "Running... ctrl^C to stop"
 pgset "start" 
 echo "Done"

#grep -h pps /proc/net/pktgen/eth*