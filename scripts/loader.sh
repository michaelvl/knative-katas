#! /bin/bash

SCRIPT=$(readlink -f $0)
SCRIPTPATH=`dirname $SCRIPT`

CLIENTS=${1:-10}
REQUESTS=${2:-10}

FULLCMD="$SCRIPTPATH/curler.sh ::: "
ii=0
while [ $ii -lt $CLIENTS ]; do
    FULLCMD="$FULLCMD $REQUESTS"
    let ii=ii+1
done

parallel --will-cite --line-buffer $FULLCMD
