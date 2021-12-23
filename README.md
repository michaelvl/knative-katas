# Knative Katas

This repository contain exercises for [Knative](https://knative.dev), the
Kubernetes platform for building event-driven and, kind-of, serverless
workloads. Exercises assume access to a Kubernetes cluster with Knative.

Since network access to clusters vary, exercises use the following environment
variables to define how to access the cluster network. Adjust these as necessary
for your cluster.

```console
export KATAS_DOMAIN=example.com
export KATAS_PROTOCOL=https
export KATAS_NAMESPACE=default
```

Exercises are build around the `kn` tool. You can either install this locally,
or use the script in this repository for a container-based solution:

```console
alias kn='scripts/kn.sh'
```

## Exercises

### Knative Serving

- [Blue/green and Canary Deployments](blue-green-and-canary.md)
- Header-based Revision Routing
- Configuring and Optimizing Autoscaling

### Knative Eventing
