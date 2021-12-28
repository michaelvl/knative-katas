[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #brokers #triggers #dead-letter #dead-letter-sink)

# Brokers and Triggers

This exercise demonstrates Knative eventing brokers and triggers. These are the
basic components used to build a message bus for event distribution and define
filtering on which events applications should receive.

A Knative `Broker` is defined 

```yaml
apiVersion: eventing.knative.dev/v1
kind: Broker
metadata:
  name: broker-a

```

```console
kubectl apply -f deploy/broker.yaml
```

```yaml
apiVersion: sources.knative.dev/v1
kind: ContainerSource
metadata:
  name: event-emitter
spec:
  template:
    spec:
      containers:
      - image: ghcr.io/michaelvl/knative-katas:sha-e50d02a
        workingDir: /apps/event-emitter
        env:
         - name: APP_DATA
           value : '{"msg": "Hello from container source through broker!"}'
         - name: APP_CRON_SCHEDULE
           value : '*/5 * * * * *'
  sink:
    ref:
      apiVersion: eventing.knative.dev/v1
      kind: Broker
      name: broker-a

```

```console
kubectl apply -f deploy/container-source-broker.yaml
```

```console
kubectl apply -f deploy/simple-service.yaml
```

The source will emit an event every 5 seconds, however, if we observe logs from
the `simple` service, we do not yet see any events:

```console
stern "simple-.*" -c user-container
```

Whats missing is a filter that attaches to the broker and forwards events to
`simple` service. A `Trigger` defines a broker, a filter and a Sink:

```yaml
apiVersion: eventing.knative.dev/v1
kind: Trigger
metadata:
  name: trigger1
spec:
  broker: broker-a
  filter:
    attributes:
      type: type-example
  subscriber:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: simple

```



```console
kubectl apply -f deploy/trigger.yaml
```


## One to Many Distribution

```console
kubectl apply -f deploy/simple-service2.yaml
```

```console
stern "simple2-.*" -c user-container
```

```console
kubectl apply -f deploy/trigger2.yaml
```





## Cleanup

```console
kubectl delete -f deploy/trigger.yaml
kubectl delete -f deploy/trigger2.yaml
kubectl delete -f deploy/simple-service.yaml
kubectl delete -f deploy/simple-service2.yaml
kubectl delete -f deploy/container-source-broker.yaml
kubectl delete -f deploy/broker.yaml
```
