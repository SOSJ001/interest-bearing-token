
import { Connection } from "@solana/web3.js";
import { clusterApiUrl } from "@solana/web3.js";
export const connection = new Connection("http://127.0.0.1:8899", "confirmed"); //connecting to localhost rpc
// export const connection = new Connection( clusterApiUrl("devnet"), "confirmed"); //connecting to devnet rpc

