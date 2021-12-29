#! /bin/bash

set -e

TAG=$1

SCRIPT=$(readlink -f $0)
SCRIPTPATH=`dirname $SCRIPT`

if [ -z "$TAG" ]; then
    SHA=`git rev-parse --short HEAD`
    TAG="sha-$SHA"
    echo "No image tag specified, using HEAD: $TAG"
fi

IMAGE=ghcr.io/michaelvl/knative-katas

DIGEST=$($SCRIPTPATH/../scripts/skopeo.sh inspect docker://$IMAGE:$TAG | jq -r .Digest)

#IMAGE_TAG=":$TAG"
IMAGE_TAG="@$DIGEST"

for m in deploy/*.yaml; do
    echo "Updating $m"
    sed -i -E "s#(^\s+-\s+image\:\s+$IMAGE)\:.*#\1$IMAGE_TAG#" $m
done
