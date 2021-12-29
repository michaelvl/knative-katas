[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #brokers #dead-letter #dead-letter-sink)

# Delivery Errors - Dead Letter Sinks

This exercise demonstrates how Knative handles event delivery errors. Since
events are transported using HTTP POST messages, the HTTP status code indicates
the recipient status of the event. HTTP 2xx status codes are 'acknowledgements'
and all other are 'failures'.

TBD: timeouts and retries.

## Broker Delivery Errors

In case a `Broker` cannot deliver an event, a dead letter sink can be defined,
which will receive these 'un-deliverable' events.

Create a `Broker` without a dead-letter sink, a source that sends an event every
5 seconds, a service that logs recevied events and a trigger that filters events
to the service:

```console
kubectl apply -f deploy/broker.yaml
kubectl apply -f deploy/container-source-broker.yaml
kubectl apply -f deploy/simple-service-no-response.yaml
kubectl apply -f deploy/trigger.yaml
```

Observe the received events using `stern`:

```console
stern "simple-.*" -c user-container
```

### Add Dead Letter Sink

Next, we add a sink where un-deliverable events will be delivered:

```console
kubectl apply -f deploy/dead-letter-sink.yaml
```

We observe the output from this sink - initially we expect no events:

```console
stern "dead-letter-.*" -c user-container
```

And we update the broker configuration with delivery information:

```yaml
apiVersion: eventing.knative.dev/v1
kind: Broker
metadata:
  name: broker-a
spec:
  delivery:
    deadLetterSink:
      ref:
        apiVersion: serving.knative.dev/v1
        kind: Service
        name: dead-letter-sink

```

```console
kubectl apply -f deploy/broker-dead-letter.yaml
```

### Introduce Delivery Errors

Initially the service responds to events using HTTP status code 200 (this is
configured with the `APP_HTTP_STATUS_CODE` environment variable in
`deploy/simple-service-no-response.yaml`).

> The service also configures the application to discard the JSON response body. Services are allowed to return events, but these must be valid cloudevents. The 'plain JSON' of the example service is not a fully valid cloudevent and returning this would be considered as a delivery error.

To introduce permanent delivery errors, we can edit the environment variable,
e.g. with the following command - change the value to e.g. `400`:

```console
KUBE_EDITOR=nano kubectl edit service.serving simple
```

After this, the service POD(s) will be recreated and the log output will still
show the received event.

However, since the `simple` service now returns an error when receiving the
event, the broker will forward the event to the dead-letter-sink and we should
be able to observe this in the `stern` log output.

Now, edit the `simple` service again and change the `APP_HTTP_STATUS_CODE`
environment variable back to `200`. After this, the dead-letter service will no
longer receive the event and eventually the dead-letter service POD will be
terminated.

## Cleanup

```console
kubectl delete -f deploy/dead-letter-sink.yaml
kubectl delete -f deploy/trigger.yaml
kubectl delete -f deploy/simple-service-no-response.yaml
kubectl delete -f deploy/container-source-broker.yaml
kubectl delete -f deploy/broker-dead-letter.yaml
```
