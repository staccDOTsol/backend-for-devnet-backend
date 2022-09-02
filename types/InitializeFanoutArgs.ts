import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface InitializeFanoutArgsFields {
  epoch: number
  bump: number
}

export interface InitializeFanoutArgsJSON {
  epoch: number
  bump: number
}

export class InitializeFanoutArgs {
  readonly epoch: number
  readonly bump: number

  constructor(fields: InitializeFanoutArgsFields) {
    this.epoch = fields.epoch
    this.bump = fields.bump
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u8("epoch"), borsh.u8("bump")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InitializeFanoutArgs({
      epoch: obj.epoch,
      bump: obj.bump,
    })
  }

  static toEncodable(fields: InitializeFanoutArgsFields) {
    return {
      epoch: fields.epoch,
      bump: fields.bump,
    }
  }

  toJSON(): InitializeFanoutArgsJSON {
    return {
      epoch: this.epoch,
      bump: this.bump,
    }
  }

  static fromJSON(obj: InitializeFanoutArgsJSON): InitializeFanoutArgs {
    return new InitializeFanoutArgs({
      epoch: obj.epoch,
      bump: obj.bump,
    })
  }

  toEncodable() {
    return InitializeFanoutArgs.toEncodable(this)
  }
}
