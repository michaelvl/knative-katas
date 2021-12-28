#! /bin/bash

set -e

TAG=$1

if [ -z "$TAG" ]; then
    SHA=`git rev-parse --short HEAD`
    TAG="sha-$SHA"
    echo "No image tag specified, using HEAD: $TAG"
fi

IMAGE=ghcr.io/michaelvl/knative-katas

for m in deploy/*.yaml; do
    echo "Updating $m"
    sed -i -E "s#(^\s+-\s+image\:\s+$IMAGE\:).*#\1$TAG#" $m
done
