import os
import time
from flask import Flask, request, make_response
import uuid
import json

app = Flask(__name__)

hostname = os.uname()[1]
msg = os.environ.get('APP_MSG', 'Hello, world!')
delay = int(os.environ.get('APP_DELAY', 0))

@app.route('/', methods=['POST'])
def main():
    app.logger.warning(request.data)
    try:
        data = json.loads(request.data.decode('utf8'))
    except:
        data = None
    response = make_response({
        'msg': msg,
        'input': data,
        'hostname': hostname
    })
    response.headers['Ce-Id'] = str(uuid.uuid4())
    response.headers['Ce-specversion'] = '0.3'
    response.headers['Ce-Source'] = 'knative-simple'
    response.headers['Ce-Type'] = 'dk.pixelperfekt.knative-simple/msg'

    time.sleep(delay)

    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
