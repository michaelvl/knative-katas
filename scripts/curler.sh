#! /bin/bash

REQUESTS=${1:-1}

ii=0
while [ $ii -lt $REQUESTS ]; do
    curl -s -X POST -H 'Host: simple.default.example.com' 192.168.122.220:80 | jq --compact-output .
    let ii=ii+1
done
