import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializeArgs {
  epoch: number
}

export interface InitializeAccounts {
  predictions: PublicKey
  auth: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u32("epoch")])

export function initialize(args: InitializeArgs, accounts: InitializeAccounts) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.predictions, isSigner: false, isWritable: true },
    { pubkey: accounts.auth, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      epoch: args.epoch,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
