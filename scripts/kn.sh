#!/bin/bash

#set -x
set -e

KN_IMAGE=gcr.io/knative-releases/knative.dev/client/cmd/kn:latest
KUBECFG="${HOME}/.kube:${HOME}/.kube:ro"
KN_CMD="docker run --rm --net host --user $(id -u):$(id -g) -e KUBECONFIG -v $KUBECFG ${KN_IMAGE}"
${KN_CMD} "$@"
