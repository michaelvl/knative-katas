const os = require('os');
const { HTTP, CloudEvent } = require('cloudevents');
const cron = require("node-cron");
const axios = require("axios").default;

const hostname = os.hostname();
const data = process.env.APP_DATA || '{"msg": "Hello world!"}';
const cron_schedule = process.env.APP_CRON_SCHEDULE || '*/1 * * * *';
const sink_url = process.env.K_SINK;

console.log('Sink URL', sink_url);

process.on('SIGTERM', () => {
    console.info("Interrupted")
    process.exit(0)
})

cron.schedule(cron_schedule, () => {
    const ce = new CloudEvent({ type: 'type-example', source: 'source-example', data });
    const message = HTTP.binary(ce); // Or HTTP.structured(ce)

    console.log('Sending event', ce.id);
    axios({
	method: "post",
	url: sink_url,
	data: message.body,
	headers: message.headers,
    });
});
