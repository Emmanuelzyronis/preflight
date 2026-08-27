import { Account, RpcProvider, constants, type Call } from 'starknet';
import { createPrivateTransfers } from '@starkware-libs/starknet-privacy-sdk';

const required = (name: string) => { const value = process.env[name]; if (!value) throw new Error(`${name} is required`); return value; };
const privateKey = required('DEMO_WALLET_PRIVATE_KEY');
const address = required('DEMO_WALLET_ADDRESS');
const recipient = required('DEMO_RECIPIENT_ADDRESS');
const token = required('DEMO_TOKEN_ADDRESS');
const pool = required('STRK20_POOL_ADDRESS');
const rpcUrl = required('RPC_URL');
const provingUrl = required('PRIVACY_PROVING_URL');
const discoveryUrl = required('PRIVACY_DISCOVERY_URL');
const provider = new RpcProvider({ nodeUrl: rpcUrl });
const account = new Account(provider, address, privateKey);
const transfers = createPrivateTransfers({
  account,
  viewingKeyProvider: { getViewingKey: async () => BigInt(privateKey) },
  provingProvider: { url: provingUrl, chainId: constants.StarknetChainId.SN_MAIN },
  discoveryProvider: { url: discoveryUrl },
  poolContractAddress: pool,
});

async function waitForProofDepth(blockNumber: number) {
  let latest = await provider.getBlockNumber();
  while (blockNumber >= latest - 10) {
    await new Promise(resolve => setTimeout(resolve, 10_000));
    latest = await provider.getBlockNumber();
  }
}

async function submit(label: string, build: (provingBlock: number) => Promise<{ callAndProof: { call: Call; proof: { proofFacts: string[]; data: string } } }>) {
  const latest = await provider.getBlockNumber();
  const result = await build(Math.max(0, latest - 10));
  const transaction = await account.execute(result.callAndProof.call, { proofFacts: result.callAndProof.proof.proofFacts, proof: result.callAndProof.proof.data });
  const receipt = await provider.waitForTransaction(transaction.transaction_hash);
  if (!receipt.isSuccess()) throw new Error(`${label} failed: ${transaction.transaction_hash}`);
  if (!('block_number' in receipt)) throw new Error(`${label} confirmed without a block number`);
  console.log(`${label} confirmed: ${transaction.transaction_hash}`);
  await waitForProofDepth(receipt.block_number);
  return transaction.transaction_hash;
}

// Exact demo amounts in token base units: shield 238, private transfer 100, unshield 50.
const common = { autoDiscover: { notes: 'refresh' as const, channels: 'refresh' as const }, autoSelectNotes: 'naive' as const };
const shieldHash = await submit('shield (238)', provingBlock => transfers.build({ ...common, provingBlockId: { block_number: provingBlock } }).with(token, operations => { operations.deposit({ amount: 238n }); }).surplusTo(address).execute());
const transferHash = await submit('private transfer (100)', provingBlock => transfers.build({ ...common, autoSetup: true, provingBlockId: { block_number: provingBlock } }).with(token, operations => { operations.transfer({ recipient, amount: 100n }); }).surplusTo(address).execute());
const unshieldHash = await submit('unshield (50)', provingBlock => transfers.build({ ...common, provingBlockId: { block_number: provingBlock } }).with(token, operations => { operations.withdraw({ recipient, amount: 50n }); }).surplusTo(address).execute());
console.log(`\nDemo transaction hashes\nshield:   ${shieldHash}\ntransfer: ${transferHash}\nunshield: ${unshieldHash}`);
