const os = require('os');
const process = require('process');
const express = require('express');
const { HTTP, CloudEvent } = require('cloudevents');
const bodyParser = require('body-parser')

const port = process.env.PORT || 8080;
const filter_key = process.env.APP_FILTER_KEY;
const filter_value = process.env.APP_FILTER_VALUE;

const app = express();
app.use(express.json());

process.on('SIGTERM', () => {
    console.info("Interrupted")
    process.exit(0)
})

app.post('/', (req, res) => {
    try {
        let event = HTTP.toEvent({ headers: req.headers, body: req.body })
        console.log('Event version:', event.specversion, 'type:', event.type, 'id:', event.id);
        console.log('Data:', event.data);

	if (filter_key in event.data && event.data[filter_key].includes(filter_value)) {
	    console.log('Event filter status ACCEPT');
	    const message = HTTP.binary(event); // Or HTTP.structured(ce)
	    res.set(message.headers)
	    res.status(200).send(message.body);
	} else {
	    console.log('Event filter status DISCARD');
	    res.status(200).end();
	}
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
