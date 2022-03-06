const os = require('os');
const process = require('process');
const express = require('express');
const { HTTP, CloudEvent } = require('cloudevents');
const bodyParser = require('body-parser')

const hostname = os.hostname();

const msg = process.env.APP_MSG || 'Hello, world!';
const delay = process.env.APP_DELAY || 0;
const port = process.env.PORT || 8080;
const http_status_code = process.env.APP_HTTP_STATUS_CODE || 200;
const event_resp_type = process.env.APP_EVENT_RESPONSE_TYPE || 'type-example';
const event_resp_source = process.env.APP_EVENT_RESPONSE_SOURCE || 'simple-example';
const discard_response = process.env.APP_DISCARD_RESPONSE;
const http_log = process.env.APP_HTTP_LOG || 0;
const event_log = process.env.APP_EVENT_LOG || 0;

const app = express();
app.use(express.json());

process.on('SIGTERM', () => {
    console.info("Interrupted")
    process.exit(0)
})

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

app.post('/', (req, res) => {
    if (http_log) {
	console.log("HTTP headers:", req.headers);
	console.log("HTTP body:", req.body);
    }
    try {
        let event = HTTP.toEvent({ headers: req.headers, body: req.body })
	if (event_log) {
	    console.log('Event:', event)
	}
        console.log('Event version:', event.specversion, 'type:', event.type, 'id:', event.id);
        console.log('Data:', event.data);

        data = {
	    'msg': msg,
	    'input': event,
	    hostname
        }

	const ce = new CloudEvent({ type: event_resp_type, source: event_resp_source, data });
	const message = HTTP.binary(ce); // Or HTTP.structured(ce)

        sleep(delay).then(() => {
	    if (discard_response) {
		console.log('Reponding with HTTP', http_status_code);
		res.status(http_status_code).send();
	    } else {
		console.log('Reponding with HTTP', http_status_code, 'event type', event_resp_type);
		res.set(message.headers)
		res.status(http_status_code).send(message.body);
	    }
	});

    } catch(err) {
        console.error('Error', err);
        res.status(415)
            .header("Content-Type", "application/json")
            .send(JSON.stringify(err));
    }
});

app.listen(port, () => {
    console.log('Simple app listening on port', port);
});
