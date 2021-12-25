[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #source #sink #pingsource)

# Source to Sink

First, create a Knative service using `kubectl`:

```console
kubectl apply -f deploy/simple-service.yaml
```

Test the deployed service by sending a single event to it. The input event data
is shown in the `input` output field. Note, that the returned data is JSON but
not a formal CloudEvent.

```console
export UUID=$(uuidgen)
curl -v -X POST -H "content-type: application/json" -H "ce-specversion: 1.0" -H "ce-source: curl" -H "ce-type: example" -H "ce-id: $UUID" $KATAS_PROTOCOL://simple.$KATAS_NAMESPACE.$KATAS_DOMAIN | jq .
```

```console
alias stern=scripts/stern.sh
stern "simple*" -c user-container
```

```console
kn sources list-types
```

```
TYPE              S     NAME                                   DESCRIPTION
ApiServerSource   X     apiserversources.sources.knative.dev   Watch and send Kubernetes API events to addressable
ContainerSource   X     containersources.sources.knative.dev   Generate events by Container image and send to addressable
PingSource        X     pingsources.sources.knative.dev        Send periodically ping events to addressable
SinkBinding       X     sinkbindings.sources.knative.dev       Binding for connecting a PodSpecable to addressable
```

```console
kubectl apply -f deploy/ping-source.yaml
```

```console
kn source ping list
```

```
NAME                SCHEDULE      SINK          AGE    CONDITIONS   READY   REASON
ping-every-minute   */1 * * * *   ksvc:simple   27m    3 OK / 3     True
```

```console
kn source ping describe ping-every-minute
```

```
Name:         ping-every-minute
Namespace:    default
Annotations:  sources.knative.dev/creator=admin240, sources.knative.dev/lastModifier=admin240
Age:          28m
Schedule:     */1 * * * *
Data:         {"msg": "Hello from Ping!"}

Sink:        
  Name:      simple
  Resource:  Service (serving.knative.dev/v1)

Conditions:  
  OK TYPE            AGE REASON
  ++ Ready           27m 
  ++ Deployed        27m 
  ++ SinkProvided    28m 
```

## Cleanup

```console
kubectl delete -f deploy/ping-source.yaml
kubectl delete -f deploy/simple-service.yaml
```
