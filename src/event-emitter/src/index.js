const os = require('os');
const { HTTP, CloudEvent } = require('cloudevents');
const cron = require("node-cron");
const axios = require("axios").default;

const hostname = os.hostname();
const data = process.env.APP_DATA || '{"msg": "Hello world!"}';
const cron_schedule = process.env.APP_CRON_SCHEDULE || '*/1 * * * *';
const sink_url = process.env.K_SINK;
const event_type = process.env.APP_EVENT_TYPE || 'type-example';
const event_source = process.env.APP_EVENT_SOURCE || 'simple-example';
const event_partition_key = process.env.APP_EVENT_PARTITION_KEY;

console.log('Sink URL', sink_url);

process.on('SIGTERM', () => {
    console.info("Interrupted")
    process.exit(0)
})

cron.schedule(cron_schedule, () => {
    const ce = new CloudEvent({ type: event_type,
                                source: event_source,
                                data,
                              });
    const message = HTTP.binary(ce); // Or HTTP.structured(ce)

    console.log('Sending event', ce.id);
    axios({
        method: "post",
        url: sink_url,
        data: message.body,
        headers: {...message.headers,
		  // https://github.com/cloudevents/spec/blob/main/cloudevents/extensions/partitioning.md
                  ...(event_partition_key && {'ce-partitionKey': event_partition_key})
		 }
    });
});
