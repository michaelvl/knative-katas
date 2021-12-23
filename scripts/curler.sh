#! /bin/bash

URL=$1
REQUESTS=${2:-1}

ii=0
while [ $ii -lt $REQUESTS ]; do
    curl -s -X POST $URL | jq --compact-output .
    let ii=ii+1
done
