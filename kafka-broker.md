[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #brokers #triggers #kafka # kafka-broker)

# Kafka Broker

```console
kubectl apply -f deploy/broker-kafka.yaml
```

```console
kubectl apply -f deploy/container-source-broker.yaml
kubectl apply -f deploy/simple-service-no-response.yaml
kubectl apply -f deploy/trigger.yaml
```

```console
stern "simple-.*" -c user-container
```

```console
kubectl get imc
```

```
NAME                   URL                                                                AGE     READY   REASON
broker-a-kne-trigger   http://broker-a-kne-trigger-kn-channel.default.svc.cluster.local   3m35s   True
```

When we created the Kafka-based broker with `deploy/broker-kafka.yaml` and named
it `broker-a`, a topic named `knative-broker-<NAMESPACE>-broker-a` was created,
i.e. if we are deploying in the default namespace, we can monitor the events
published to the broker by listening to the `knative-broker-default-broker-a`
topic:

```console
kubectl -n kafka run kafka-consumer -ti --image=quay.io/strimzi/kafka:0.28.0-kafka-3.1.0 --rm=true --restart=Never -- bin/kafka-console-consumer.sh --bootstrap-server my-cluster-kafka-bootstrap:9092 --topic knative-broker-default-broker-a --from-beginning
```

```console
kubectl delete -f deploy/trigger.yaml
kubectl delete -f deploy/simple-service-no-response.yaml
kubectl delete -f deploy/container-source-broker.yaml
kubectl delete -f deploy/broker-kafka.yaml
```
