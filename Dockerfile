FROM node:20.17.0

WORKDIR /app

RUN apt update && apt install -y supervisor postgresql
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY . .
RUN cd operator && npm install && cd ..

CMD ["/usr/bin/supervisord"]