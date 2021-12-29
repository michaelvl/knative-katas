[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #parallel #filter #branch)

# Flows - Parallels and Branches

This exercise will describe a higher-level construct for designing event
flows. Constructs like source-to-sink or global broker/message-bus are either
one-to-one or global hub-spoke constructs. Knative `Parallel` provide an
modeling construct between the two.

A `Parallel` is a Knative addressable that we can forward event to, and which
will send a copy of the event to one or more services, i.e. we define parallel
processing of the event. This is very much like creating a `Channel` and
`Subscriptions` and a `Parallel` is basically just a higher level resource for
managing a `Channel` and `Subscriptions` - with one exception. A `Parallel`
allow filter services on each branch and this allows for if/else branch
constructs in the event flow.

We will create the following - an 'emitter1' that use a `Parallel` as sink, and
the `Parallel` have two services. Both services will use an 'event-logger' and
their output. Note, that a `Parallel` allow different sinks for the services,
however, we will not use that in this exercise.

```
                          --- simple ----
                         /               \
emitter1 --- parallel ---                 --- event-logger
                         \               /
                          --- simple2 ---
```

Create the two intermediate services and the event logger:

```console
kubectl apply -f deploy/simple-service.yaml
kubectl apply -f deploy/simple2-service-response-type2.yaml
kubectl apply -f deploy/event-logger.yaml
```

Use the following to watch the logs from the event-logger:

```console
stern "event-logger-.*" -c user-container
```

Next, we create a `Parallel`. The `Parallel` contain a list of subscribers and a
common `reply` sink:

```yaml
apiVersion: flows.knative.dev/v1
kind: Parallel
metadata:
  name: copy-events
spec:
  reply:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: event-logger
  branches:
    - subscriber:
        ref:
          apiVersion: serving.knative.dev/v1
          kind: Service
          name: simple
    - subscriber:
        ref:
          apiVersion: serving.knative.dev/v1
          kind: Service
          name: simple2

```

Create the `Parallel`:

```console
kubectl apply -f deploy/parallel.yaml
```

Next, we create an event emitter which use the `Parallel` as sink:

```console
kubectl apply -f deploy/container-source-parallel.yaml
```

Now we should be able to observe events in the log output from the
event-logger. The event emitter sends an event every 10 seconds, i.e. we should
see something similar to the following every 10 seconds:

```
Event version: 1.0 type: type-example id: 78a227e9-cd07-422e-9dee-d46163de0a63
Data: {
  ...
  input: {
    ...
    id: 'b8ed6372-3436-4174-aff1-a58c78a060f1',
    source: 'emitter1',
    data: { msg: 'Hello from container source 1 through parallel!' }
  },
  hostname: 'simple-00001-deployment-679cbcbd5b-d45g9'
}
Event version: 1.0 type: type-example2 id: c0b896c4-3a94-48b1-8339-2b9edc162ddd
Data: {
  ...
  input: {
    ...
    id: 'b8ed6372-3436-4174-aff1-a58c78a060f1',
    source: 'emitter1',
    data: { msg: 'Hello from container source 1 through parallel!' }
  },
  hostname: 'simple2-00001-deployment-76c44f97d6-tzh9t'
}
```

This shows, that the `event-logger` received two events with the `hostname`
field indicating which of the services `simple` or `simple2` that handled the
events. The `simple` and `simple2` services wraps the incoming event into the
output `input` field and from this we can see that they both received the same
event (observe the same `id` in both).

## Filtering

The `Parallel` we currently use do not have any filters on events. In the
following we ingest events with different payloads using a second event emitter
and we will add filters to each branch in the `Parallel`, i.e. we will create
the following:

```
emitter1 ---                  --- filter --- simple ----
            \                /                          \
             --- parallel ---                            --- event-logger
            /                \                          /
emitter2 ---                  --- filter --- simple2 ---
```

Create a second source with the following command:

```console
kubectl apply -f deploy/container-source2-parallel.yaml
```

Now we will see four events every 10 seconds, with the `data.msg` field
containing the sub-strings 'source 1' and 'source 2' We will create filters such
that events with sub-string 'source 1' goes to the 'simple' service and events
with sub-string 'source 2' goes to 'simple2' service.

Filters are ordinary Knative 'addressable' services. Create then with the
following:

```console
kubectl apply -f deploy/filter-services.yaml
```

Next, we extend the `Parallel` with the filters:

```yaml
apiVersion: flows.knative.dev/v1
kind: Parallel
metadata:
  name: copy-events
spec:
  reply:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: event-logger
  branches:
    - filter:
        ref:
          apiVersion: serving.knative.dev/v1
          kind: Service
          name: filter1
      subscriber:
        ref:
          apiVersion: serving.knative.dev/v1
          kind: Service
          name: simple
    - filter:
        ref:
          apiVersion: serving.knative.dev/v1
          kind: Service
          name: filter2
      subscriber:
        ref:
          apiVersion: serving.knative.dev/v1
          kind: Service
          name: simple2

```

These filter services and the associated subscription is basically a small
`Sequence`, i.e. the `Parallel` sends the event to the filter. The filter can
then drop the event or return it in the response. If an event is returned it is
passed on to the subscription service.

Update the `Parallel` with the filters:

```console
kubectl replace -f deploy/parallel-with-filters.yaml
```

Next, we will observe only two events per 10 second interval, and we will see a
correlation with the prefix of the `hostname` field (which service processed the
event) and the `input.data.msg` content.

```
Event version: 1.0 type: type-example id: c69bcafd-343b-40ed-bfac-015e8db3afaa
Data: {
  ...
  input: {
    ...
    id: '917e7947-0b10-499f-9f1b-86fb4aa0d609',
    source: 'emitter1',
    data: { msg: 'Hello from container source 1 through parallel!' }
  },
  hostname: 'simple-00001-deployment-679cbcbd5b-d45g9'
}
Reponding with HTTP 200
Event version: 1.0 type: type-example2 id: 51d93ec2-20b9-4760-8e9b-fdc52658765e
Data: {
  ...
  input: {
    ...
    id: 'c3d77431-f7bb-4283-ac13-854d645b1ffa',
    source: 'emitter2',
    data: { msg: 'Hello from container source 2 through parallel!' }
  },
  hostname: 'simple2-00001-deployment-76c44f97d6-tzh9t'
}
```

### When is Filtering a Good Idea

Obviously filtering like this could be more efficient if it was built into the
services, however, separating the filter and the 'action' allows for better
composability of services, i.e. the 'action' could be a 3rd party service that
does not include any filtering in itself.

## Cleanup

```console
kubectl delete -f deploy/simple-service.yaml
kubectl delete -f deploy/simple2-service-response-type2.yaml
kubectl delete -f deploy/event-logger.yaml
kubectl delete -f deploy/container-source-parallel.yaml
kubectl delete -f deploy/container-source2-parallel.yaml
kubectl delete -f deploy/filter-services.yaml
kubectl delete -f deploy/parallel-with-filters.yaml
```