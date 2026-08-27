# Mainnet demo wallet

This script is manual-only. The canonical action sequence is a 238-base-unit shield, a 100-base-unit private transfer, and a 50-base-unit unshield. Each transaction confirms before the next is attempted.

1. Create a disposable Starknet account and fund it with enough ETH for fees and the demo token. Verify the token, pool, and recipient addresses before proceeding.
2. Copy `.env.example` to a local ignored `.env`. Set `RPC_URL`, `STRK20_POOL_ADDRESS`, `PRIVACY_PROVING_URL`, `PRIVACY_DISCOVERY_URL`, `DEMO_WALLET_ADDRESS`, `DEMO_WALLET_PRIVATE_KEY`, `DEMO_TOKEN_ADDRESS`, and `DEMO_RECIPIENT_ADDRESS`.
3. Use Node.js 24 or newer, run `npm install`, then `npm run demo:run`.

The script uses the official privacy SDK to discover private state and generate real proofs. It submits the proof-bearing call with the private-key account, waits for confirmation and the required proof depth before continuing, stops on any failure, and prints all three hashes.

Never use a real user's key, never commit `.env`, and never run this against an account holding meaningful funds. The script stops immediately on any failed transaction.
