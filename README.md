# Radar Launch API

Handles backend measures for the [Radar Launch](https://launch.radardao.xyz)

The frontend can be found [here](https://github.com/RadarDAO-xyz/radar-launch-frontend/).


View the Postman collection for this API [here](https://www.postman.com/soupcreations/workspace/radar-api/collection/17951518-cab7c681-b96f-434e-ae63-6cd6671d6597?action=share&creator=17951518).

## Quick Start

Copy the `.env.template` to `.env` and fill in the variables with appropriate data

You can start the application locally using

```sh
npm run dev
# or
yarn dev
```

This will host it on `::3000`.

## Production host

The [production host](https://api.radardao.xyz/launch) is proxied using nginx, which is why the server is listening at odd ports, like 82 and 445 (see [ecosystem.config.js](/ecosystem.config.js)). Nginx redirects all /launch urls to this server.


