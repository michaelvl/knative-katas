import os
import time
from flask import Flask, request, make_response
import uuid
import json

app = Flask(__name__)

msg = os.environ.get('APP_MSG', 'Hello, world!')
delay = int(os.environ.get('APP_DELAY', 0))

@app.route('/', methods=['POST'])
def hello_world():
    app.logger.warning(request.data)
    data = json.loads(request.data.decode('utf8'))
    response = make_response({
        'msg': msg,
        'input': data
    })
    response.headers['Ce-Id'] = str(uuid.uuid4())
    response.headers['Ce-specversion'] = '0.3'
    response.headers['Ce-Source'] = 'hello-world'
    response.headers['Ce-Type'] = 'dk.pixelperfekt.hello-world/msg'

    time.sleep(delay)

    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
