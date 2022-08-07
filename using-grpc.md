[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #grpc #blue-green #canary)

# Using gRPC

This exercise demonstrates the use of Knative eventing with gRPC, and we will
demonstrate it using the [sentences](https://github.com/MichaelVL/istio-katas/sentences-app/app-grpc)
application from the [Istio-katas](https://github.com/MichaelVL/istio-katas).

The sentences application consists of a frontend `sentences` and two backends,
`age` and `name`. The frontend communicates with the backends using gRPC.


```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  labels:
    app: sentences
    mode: sentence
  name: sentences
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/target: "1"
    spec:
      containers:
      - image: ghcr.io/michaelvl/istio-katas@sha256:4a26235a20b67c1a0650da8ad28d901a9942af52ab9dad09f283c2142f256d4c
        name: sentences
        args:
        - /usr/src/app-grpc/sentences.py
        env:
        - name: "SENTENCE_MODE"
          value: "sentence"
        - name: "SENTENCE_AGE_SVC_URL"
          value: "age.default.svc.cluster.local:80"
        - name: "SENTENCE_NAME_SVC_URL"
          value: "name.default.svc.cluster.local:80"
        ports:
        - name: http1
          containerPort: 5000

```

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  labels:
    app: sentences
    mode: age
  name: age
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/target: "1"
    spec:
      containers:
      - image: ghcr.io/michaelvl/istio-katas@sha256:4a26235a20b67c1a0650da8ad28d901a9942af52ab9dad09f283c2142f256d4c
        name: age
        args:
        - /usr/src/app-grpc/sentences.py
        env:
        - name: "SENTENCE_MODE"
          value: "age"
        ports:
        - name: h2c
          containerPort: 5000

```

Note, that the `age` service specifies a port name of `h2c` whereas the `sentences` service specifies `http1`

Deploy the three services:

```console
kubectl apply -f deploy/v1-grpc
```

```console
watch -n 0.5 kubectl get po
```

Next, run the following command to request a sentence:

```console
time curl $KATAS_PROTOCOL://sentences.$KATAS_NAMESPACE.$KATAS_DOMAIN
```

Next, run the following command to generate traffic from 10 clients using the
[k6](https://github.com/grafana/k6) load test tool. Note how the load scenario
starts with a single user, i.e. Knative will eventually scale each of the
services to a single instance. After a while, the number of users are rapidly
scaled up to 10 and we will observe Knative scaling accordingly.

```console
k6 run --vus 1 --stage 1m40s:1,4s:10,2m:10 scripts/k6-load-test.js
```





## Cleanup

```console
kubectl delete -f deploy/v1-grpc
```
