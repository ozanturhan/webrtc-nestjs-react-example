# WebRTC Multi Peers Example With React & NestJS

Heroku App: https://react-socket-io-webrtc-client.herokuapp.com/

## Start Development

### Docker Redis

```
docker run --name test-redis -d -p 6379:6379 redis
```

### NestJS Server

```
cd server
yarn install
yarn start:dev
```

### React Client

```
cd web
yarn install
yarn start
```

- Web Client: http://localhost:3000

## Heroku Deployment

### NestJS Server

```
heroku create -a nestjs-webrtc-server
heroku git:remote -a nestjs-webrtc-server
heroku features:enable http-session-affinity // Enable Websocket
git subtree push --prefix server heroku master
```

### React Client

```
heroku create -a react-socket-io-webrtc-client
heroku git:remote -a react-socket-io-webrtc-client
git subtree push --prefix web heroku master
```

Production environment defined on Heroku Dashboard with Config Vars
