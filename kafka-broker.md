[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #brokers #triggers #kafka #kafka-broker)

# Kafka Broker

This exercise demonstrates Knative eventing brokers and triggers using a
Kafka-based broker. This differs from exercise [Brokers and
Triggers](brokers-and-triggers.mdpp) where the default Knative in-memory broker
was used. A Kafka-based broker is more suitable for production use and could
possibly be used as a managed resource from a cloud provider.

A Kafka-based broker can be defined with the following resource manifest:

```yaml
apiVersion: eventing.knative.dev/v1
kind: Broker
metadata:
  name: broker-a
  annotations:
    # case-sensitive
    eventing.knative.dev/broker.class: Kafka
spec:
  config:
    apiVersion: v1
    kind: ConfigMap
    name: kafka-broker-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: kafka-broker-config
data:
  default.topic.partitions: "4"
  default.topic.replication.factor: "1"
  bootstrap.servers: "my-cluster-kafka-bootstrap.kafka:9092"

```

For production use it would be important to understand Kafka partitioning,
ordering etc., however, for this exercise the given configuration will suffice.

Create the broker:

```console
kubectl apply -f deploy/broker-kafka.yaml
```

With the Kafka-based broker created, Knative will handle the remaining
integration. This means we can use the same source and sinks as in exercise
[Brokers and Triggers](brokers-and-triggers.mdpp):

```console
kubectl apply -f deploy/container-source-broker.yaml
kubectl apply -f deploy/simple-service-no-response.yaml
kubectl apply -f deploy/trigger.yaml
```

The source will emit an event every second, however and we can observed the
events received through the broker:

```console
stern "simple-.*" -c user-container
```

Since we are using a Kafka broker, we can look up in-memory-channels to verify
that no such resource is created:

```console
kubectl get inmemorychannels
```




```console
kubectl get brokers
```

```
NAME       URL                                                                               AGE    READY   REASON
broker-a   http://kafka-broker-ingress.knative-eventing.svc.cluster.local/default/broker-a   3m3s   True
```

When we created the Kafka-based broker with `deploy/broker-kafka.yaml` and named
it `broker-a`, a topic named `knative-broker-<NAMESPACE>-broker-a` was created,
i.e. if we are deploying in the default namespace, we can monitor the events
published to the broker by listening to the `knative-broker-default-broker-a`
topic:

```console
kubectl -n kafka run kafka-consumer -ti --image=quay.io/strimzi/kafka:0.28.0-kafka-3.1.0 --rm=true --restart=Never -- bin/kafka-console-consumer.sh --bootstrap-server my-cluster-kafka-bootstrap:9092 --topic knative-broker-default-broker-a --from-beginning
```

We can also observe the topic creation by describing the broker:

```console
kubectl describe broker broker-a
```

and see the topic creation status and topic name:

```
...
    Reason:                Topic knative-broker-default-broker-a created
    Status:                True
    Type:                  TopicReady
```

Listing topics directly through Kafka can be done with:

```console
kubectl -n kafka run kafka-consumer -ti --image=quay.io/strimzi/kafka:0.28.0-kafka-3.1.0 --rm=true --restart=Never -- bin/kafka-topics.sh --bootstrap-server my-cluster-kafka-bootstrap:9092 --list
```

## Clean up

```console
kubectl delete -f deploy/trigger.yaml
kubectl delete -f deploy/simple-service-no-response.yaml
kubectl delete -f deploy/container-source-broker.yaml
kubectl delete -f deploy/broker-kafka.yaml
```
