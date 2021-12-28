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
const discard_response = process.env.APP_DISCARD_RESPONSE;

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
    try {
        let event = HTTP.toEvent({ headers: req.headers, body: req.body })
        console.log('Event version:', event.specversion, 'type:', event.type, 'id:', event.id);
        console.log('Data:', event.data);

        data = {
	    'msg': msg,
	    'input': event,
	    hostname
        }

	const ce = new CloudEvent({ type: event_resp_type, source: 'source-simple-example', data });
	const message = HTTP.binary(ce); // Or HTTP.structured(ce)

        sleep(delay).then(() => {
	    if (discard_response) {
		res.status(http_status_code).send();
	    } else {
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
