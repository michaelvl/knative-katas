FROM docker.io/python:alpine3.15

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /apps

WORKDIR /apps

EXPOSE 8080

ENTRYPOINT [ "python" ]

CMD [ "simple/app.py" ]
