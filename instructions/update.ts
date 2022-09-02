import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateArgs {
  bull: number
  bear: number
  epoch: number
}

export interface UpdateAccounts {
  predictions: PublicKey
  auth: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u8("bull"),
  borsh.u8("bear"),
  borsh.u32("epoch"),
])

export function update(args: UpdateArgs, accounts: UpdateAccounts) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.predictions, isSigner: false, isWritable: true },
    { pubkey: accounts.auth, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([219, 200, 88, 176, 158, 63, 253, 127])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      bull: args.bull,
      bear: args.bear,
      epoch: args.epoch,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
