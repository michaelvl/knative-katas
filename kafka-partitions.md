[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #brokers #triggers #kafka #kafka-partitions #partitionKey)

# Kafka Partitions, Cloudevent `partitionKey` and Scalability

See also the specification for the cloudevents [partitioning
extension](https://github.com/cloudevents/spec/blob/main/cloudevents/extensions/partitioning.md)

Create the broker:

```console
kubectl apply -f deploy/broker-kafka.yaml
```

```console
kubectl apply -f deploy/container-source-broker-partitionkey.yaml
kubectl apply -f deploy/processing-with-5s-delay.yaml
kubectl apply -f deploy/simple-service-no-response.yaml
kubectl apply -f deploy/trigger3.yaml
```

```console
stern "event-emitter-.*"
stern "processor-.*" -c user-container
stern "simple-.*" -c user-container | grep '  id: '
```

```console
kubectl delete -f deploy/container-source-broker-partitionkey.yaml
kubectl apply -f deploy/container-source-broker.yaml
```

## Cleanup

