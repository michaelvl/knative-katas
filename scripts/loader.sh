#! /bin/bash

set -e

SCRIPT=$(readlink -f $0)
SCRIPTPATH=`dirname $SCRIPT`

CLIENTS=${1:-10}
REQUESTS=${2:-10}
URL=$3

FULLCMD="$SCRIPTPATH/curler.sh $URL ::: "
ii=0
while [ $ii -lt $CLIENTS ]; do
    FULLCMD="$FULLCMD $REQUESTS"
    let ii=ii+1
done

parallel --jobs $CLIENTS --will-cite --line-buffer $FULLCMD
