#!/bin/bash

#set -x
set -e

STERN_IMAGE=ghcr.io/stern/stern:1.21.0
KUBECFG="${HOME}/.kube:${HOME}/.kube:ro"
CMD="docker run --rm --net host --user $(id -u):$(id -g) -e KUBECONFIG -v $KUBECFG ${STERN_IMAGE}"
${CMD} "$@"
