[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #source #sink #containersource #sinkbinding)

# Custom Sources

To ingress events from sources not included in Knative, either as native sources
or as a [third-party
source](https://knative.dev/docs/eventing/sources/#third-party-sources), the
`ContainerSource` and `SinkBinding` can be used. These allow sources to be
defined using a container image, which can generate events and ingest them into
Knative sinks. The following sections describe how these work.

To demonstrate `ContainerSource` and `SinkBinding` we setup an event receiver:

```console
kubectl apply -f deploy/simple-service-with-delay.yaml
```

Observe the log output from the event receiver:

```console
stern "simple-.*" -c user-container
```

Test the event receiver by sending an event to it:

```console
scripts/curler.sh $KATAS_PROTOCOL://simple.$KATAS_NAMESPACE.$KATAS_DOMAIN 1 '{"msg":"Hello!"}' | jq .
```

## ContainerSource

The key difference between `ContainerSource` and `SinkBinding` is that
`ContainerSource` embeds the sink reference whereas `SinkBinding` keeps the
source and sinks as standalone resources and connects these with a `SinkBinding`
resource. E.g. see the following `ContainerSource` with an embedded sink
reference:

```yaml
apiVersion: sources.knative.dev/v1
kind: ContainerSource
metadata:
  name: event-emitter
spec:
  template:
    spec:
      containers:
      - image: ghcr.io/michaelvl/knative-katas@sha256:eb09ef8d1f5124c1e2348f4d4eeca8075b83e44f7c5157ea68c6c656f223dc98
        workingDir: /apps/event-emitter
        env:
         - name: APP_DATA
           value : '{"msg": "Hello from container source!"}'
  sink:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: simple

```

This source use the [event emitter](src/event-emitter/src/index.js), which is
similar to the `PingSource`, except this is our own implementation with which we
could implement arbitrary event sources.

Deploy the source:

```console
kubectl apply -f deploy/container-source.yaml
```

The source will generate an event every 1 minute, i.e. this should be observable
from the `stern` output.

Knative will start our custom source with an environment variable `K_SINK` that
is the URL where we should HTTP POST CloudEvents. The `K_SINK` environment
variable is the key integration between Knative and custom sources.

Delete the `ContainerSource` before continuing with `SinkBinding` below:

```console
kubectl delete -f deploy/container-source.yaml
```

## SinkBinding

A `SinkBinding` allow us to bind Kubernetes resources with a *PodSpec*
(`Deployment`, `Job`, `DaemonSet`, `StatefulSet` and Knative `Service`). This
*event source* is the *subject* which we bind to a sink.

As an example we will use a Kubernetes `Deployment`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deployment-event-emitter
spec:
  selector:
    matchLabels:
      app: event-emitter
  template:
    metadata:
      labels:
        app: event-emitter
    spec:
      containers:
      - image: ghcr.io/michaelvl/knative-katas@sha256:eb09ef8d1f5124c1e2348f4d4eeca8075b83e44f7c5157ea68c6c656f223dc98
        name: event-emitter
        workingDir: /apps/event-emitter
        env:
         - name: APP_DATA
           value : '{"msg": "Hello from deployment-based source!"}'

```

Deploy the `Deployment`-based source:

```console
kubectl apply -f deploy/container-source.yaml
```

And create the binding between the deployment and the sink:

```console
kubectl apply -f deploy/sink-binding.yaml
```

We can now see, that Knative have injected a `K_SINK` environment variable into
our deployment:

```console
kubectl get deploy deployment-event-emitter -o jsonpath='{.spec.template.spec.containers[*].env}' | jq .
```

I.e. observe the URL in `K_SINK`:

```
[
  {
    "name": "K_SINK",
    "value": "http://simple.default.svc.cluster.local"
  },
  ...
]
```

We can re-apply the original deployment, and this does not change the PODs
generated from our event emitter deployment:

```console
kubectl apply -f deploy/container-source.yaml
```

This is because Knative works as a mutating admission controller, i.e. it will
modify the Deployment manifest to include the `K_SINK` environment variable also
when we reapply the Deployment. This illustrates well, that we have separated
management of the source, sink and binding between these.

## Cleanup

```console
kubectl delete -f deploy/simple-service-with-delay.yaml
kubectl delete -f deploy/container-source.yaml
kubectl delete -f deploy/deployment-source.yaml
kubectl delete -f deploy/sink-binding.yaml
```
