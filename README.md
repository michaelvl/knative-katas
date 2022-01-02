# Knative Katas

This repository contain exercises for [Knative](https://knative.dev), a platform
for building event-driven serverless applications.

Knative runs on top of Kubernetes and these exercises assume access to a
Kubernetes cluster with Knative deployed.

Since network access to clusters vary, exercises use the following environment
variables to define how to access the cluster network. Adjust these as necessary
for your cluster.

```console
export KATAS_DOMAIN=example.com
export KATAS_PROTOCOL=https
export KATAS_NAMESPACE=default
```

Some of the exercises make use of the `kn` and `stern` tools. You can either
install these locally, or use the scripts in this repository for a
container-based solution:

```console
alias kn='scripts/kn.sh'
alias stern=scripts/stern.sh
```

## Exercises

### Knative Serving

- [Blue/green and Canary Deployments](blue-green-and-canary.md)
- Header-based Revision Routing
- Configuring and Optimizing Autoscaling

### Knative Eventing

- [Source to Sink](source-to-sink.md)
- [Custom Sources](custom-sources.md)
- Channels and Subscriptions
- [Brokers and Triggers](brokers-and-triggers.md)
- [Flows - Parallels and Branches](parallels-and-branches.md)
- Flows - Sequences
- [Delivery Errors - Dead Letter Sinks](delivery-errors.md)
- Delivery Errors in Flows

### Third Party Integrations

- Third Party Sources
- Metrics with Prometheus and Grafana
- Event Tracing with Jaeger
- Apache Camel-K

### Links

- [Knative reference](https://knative.dev/docs/reference/)
- [Istio katas](https://github.com/MichaelVL/istio-katas)