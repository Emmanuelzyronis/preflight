import type { BuiltCalldata } from './builder.js';

export interface SimulationResult {
  gasEstimate: string;
  emittedEvents: unknown[];
  trace: unknown;
}

interface RpcSimulationResponse {
  result?: { fee_estimation?: { gas_consumed?: string; overall_fee?: string }; trace?: unknown };
  error?: { message?: string };
}

export async function simulateAction(built: BuiltCalldata): Promise<SimulationResult> {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) throw new Error('RPC_URL must be configured for read-only simulation');
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'starknet_simulateTransactions',
    params: [[{ type: 'INVOKE', version: '0x3', sender_address: built.contractAddress, calldata: built.calldata }], { block_tag: 'latest' }, ['SKIP_VALIDATE']],
  };
  const response = await fetch(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request) });
  const payload = (await response.json()) as RpcSimulationResponse;
  if (payload.error) throw new Error(payload.error.message ?? 'Starknet simulation failed');
  const fee = payload.result?.fee_estimation;
  return { gasEstimate: fee?.gas_consumed ?? fee?.overall_fee ?? '0x0', emittedEvents: [], trace: payload.result?.trace ?? null };
}
