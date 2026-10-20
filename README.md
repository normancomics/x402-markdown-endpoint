# x402 Markdown Endpoint

Paid API: `GET /markdown?url=<page>` fetches a public web page and returns clean Markdown (`{url,title,markdown}`).

- Price: $0.01 USDC on Base mainnet via x402 v2 (`exact` scheme)
- payTo: `0x3d95D4A6DbaE0Cd0643a82b13A13b08921D6ADf7` (normancomics.eth)
- Facilitator: https://facilitator.payai.network (no API key)
- Unpaid requests get HTTP 402 with a `PAYMENT-REQUIRED` header + JSON body. Pay with any x402 client (`PAYMENT-SIGNATURE` or `X-PAYMENT` header).

Pay from your browser wallet: open `/pay` (connects MetaMask/Coinbase Wallet on Base and signs one $0.01 USDC authorization; the facilitator pays gas).

Run: `npm install && npm start` (uses `PORT`; public URL from `RENDER_EXTERNAL_URL` or `PUBLIC_URL`).
Deploy: Render Blueprint via `render.yaml` (free node web service).
