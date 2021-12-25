#! /bin/bash

URL=$1
REQUESTS=${2:-1}
DATA=${3:-""}

if [ -z "$DATA" ]; then
    DATA_ARG=""
else
    DATA_ARG="-d $DATA"
fi

ii=0
while [ $ii -lt $REQUESTS ]; do
    UUID=$(uuidgen)
    curl -s -X POST $DATA_ARG -H "content-type: application/json" -H "ce-specversion: 1.0" -H "ce-source: curl" -H "ce-type: example" -H "ce-id: $UUID" $URL | jq --compact-output .
    let ii=ii+1
done
