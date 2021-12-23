const os = require('os');
const express = require('express');
const { HTTP } = require('cloudevents');
const bodyParser = require('body-parser')

const hostname = os.hostname();

const msg = process.env.APP_MSG || 'Hello, world!';
const delay = process.env.APP_DELAY || 0;

const app = express();
app.use(express.json());

app.post('/', (req, res) => {
    try {
	let event = HTTP.toEvent({ headers: req.headers, body: req.body })
	console.log('Event version: ', event.specversion, 'type: ', event.type);
	console.log('Data: ', event.data);
	response = {
            'msg': msg,
            'input': event,
            hostname
	}
	res.status(200).send(response);
	
    } catch(err) {
	console.error('Error', err);
	res.status(415)
            .header("Content-Type", "application/json")
            .send(JSON.stringify(err));
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Simple app listening on: ', port);
});