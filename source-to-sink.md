[//]: # (Copyright, Michael Vittrup Larsen)
[//]: # (Origin: https://github.com/MichaelVL/knative-katas)
[//]: # (Tags: #knative-eventing #source #sink #pingsource)

# Source to Sink

This exercise demonstrates the most basic Knative event setup with a single event producer and a
single consumer - aka. 'Source' and 'Sink'.

![Source to Sink](images/source-to-sink.png)

## Knative Service (Sink)

First, create a Knative service that will serve as the receiver of events,
i.e. a Sink in Knative terminology. The service will log the received event and
return a JSON structure with the event data. See also [the source of the
service](src/simple/src/index.js):

```console
kubectl apply -f deploy/simple-service-with-delay.yaml
```

The YAML of the service looks like this:

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: simple
spec:
  template:
    spec:
      containerConcurrency: 1
      containers:
      - image: ghcr.io/michaelvl/knative-katas@sha256:4b3d49ac8ffe76db79415162fcf074b6ed9d8bebb0d2d168df2bddc458dbd56f
        env:
         - name: APP_DELAY
           value : "1000"

```

In a separate terminal, use the `stern` tool to display logs from instances of
the receiver. When we send events to the service, they will be shown in the
logs.

```console
stern "simple-.*" -c user-container
```

## Knative Sources

The sink is not yet receiving any events. We either need to send events manually
or create a Knative source to send events to our service.

Test the deployed service by sending a single event to it. The input event data
sent to the service is stored in the `input` field of the response from the
service. Note, that the returned data is JSON but not a formal CloudEvent.

```console
export UUID=$(uuidgen)
curl -v -X POST -d '{"msg":"Hello world"}' -H "content-type: application/json" -H "ce-specversion: 1.0" -H "ce-source: curl" -H "ce-type: example" -H "ce-id: $UUID" $KATAS_PROTOCOL://simple.$KATAS_NAMESPACE.$KATAS_DOMAIN | jq .
```

The `curl` command will return a result similar to:

```
{
  "msg": "Hello, world!",
  "input": {
    "id": "372fa748-a91e-4f27-8a62-62149c9815dd",
    "time": "2021-12-27T06:51:45.225Z",
    "type": "example",
    "source": "curl",
    "specversion": "1.0",
    "datacontenttype": "application/json",
    "data": {
      "msg": "Hello world"
    }
  },
  "hostname": "simple-00001-deployment-f57f668c5-lpmvj"
}
```

and the `stern` output will look similar to:

```
Event version: 1.0 type: example id: 372fa748-a91e-4f27-8a62-62149c9815dd
Data: { msg: 'Hello world' }
```

### Built-in Knative Sources

Knative comes with four built-in sources - see the following outputs for a short description of these:

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

We will use `PingSource` to send events with custom data based on a Cron
schedule (an event every minute). Create the `PingSource` with:

```console
kubectl apply -f deploy/ping-source.yaml
```

The manifest for the `PingSource` looks like this:

```yaml
apiVersion: sources.knative.dev/v1
kind: PingSource
metadata:
  name: ping-every-minute
spec:
  #          ┌───────────── minute (0 - 59)
  #          │ ┌───────────── hour (0 - 23)
  #          │ │ ┌───────────── day of the month (1 - 31)
  #          │ │ │ ┌───────────── month (1 - 12)
  #          │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday;
  #          │ │ │ │ │                                   7 is also Sunday on some systems)
  #          * * * * *
  schedule: "*/1 * * * *"
  contentType: "application/json"
  data: '{"msg": "Hello from Ping!"}'
  sink:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: simple

```

A list of the `PingSources` and overview details can be found from:

```console
kn source ping list
```

The output looks similar to the following. Note, that the sink here is a Knative
service named `simple` and the Cron schedule specifies an event every minute.

```
NAME                SCHEDULE      SINK          AGE    CONDITIONS   READY   REASON
ping-every-minute   */1 * * * *   ksvc:simple   27m    3 OK / 3     True
```

More details can be found using the `describe` command. Note the data included
in the event in the `Data` field.

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
kubectl delete -f deploy/simple-service-with-delay.yaml
```
