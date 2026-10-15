# FamilyInc Board Game

Implementation of Dr. Reiner Knizia's Family Inc. board game.

Yarn 4 workspaces (Node 22 or newer):

- `workspaces/client` — Next.js 16 / React 19 / Mantine 9 / Tailwind 4 front end
- `workspaces/server` — NestJS 12 socket.io game server
- `workspaces/shared` — events and payload types shared by both

## Commands

```bash
yarn install
yarn start:dev:server   # ws://localhost:3001 (set PORT to override)
yarn start:dev:client   # http://localhost:3033
yarn test               # server unit tests (game engine, chip bag, bots)
yarn workspace @familyinc/server test:e2e
yarn typecheck
yarn lint
yarn build
```

The client reads the server URL from `NEXT_PUBLIC_WS_API_URL`.
`workspaces/client/.env` points at the deployed server and
`workspaces/client/.env.development` overrides it to `http://localhost:3001`
for `next dev`.

## Notes

- NestJS 12 ships as ES modules; the server is still compiled to CommonJS and
  loads it through Node's `require(esm)`, which is why Node 22+ is required.
  The e2e test runs Jest with `--experimental-vm-modules` for the same reason.
- Each workspace keeps its own `node_modules` (`nmHoistingLimits: workspaces`);
  hoisting to the root produced a broken second copy of ESLint in the client.

## Acknowledgements

 - [Mazzoni](https://francois-steinel.fr/articles/build-lobby-based-online-multiplayer-browser-games-with-react-and-nodejs) for the excellent primer on building a basic multiplayer browser game.
