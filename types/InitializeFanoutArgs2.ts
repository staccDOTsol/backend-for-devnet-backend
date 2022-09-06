import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface InitializeFanoutArgs2Fields {
  epoch: number
  bull: number
  bear: number
}

export interface InitializeFanoutArgs2JSON {
  epoch: number
  bull: number
  bear: number
}

export class InitializeFanoutArgs2 {
  readonly epoch: number
  readonly bull: number
  readonly bear: number

  constructor(fields: InitializeFanoutArgs2Fields) {
    this.epoch = fields.epoch
    this.bull = fields.bull
    this.bear = fields.bear
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u32("epoch"), borsh.u32("bull"), borsh.u32("bear")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InitializeFanoutArgs2({
      epoch: obj.epoch,
      bull: obj.bull,
      bear: obj.bear,
    })
  }

  static toEncodable(fields: InitializeFanoutArgs2Fields) {
    return {
      epoch: fields.epoch,
      bull: fields.bull,
      bear: fields.bear,
    }
  }

  toJSON(): InitializeFanoutArgs2JSON {
    return {
      epoch: this.epoch,
      bull: this.bull,
      bear: this.bear,
    }
  }

  static fromJSON(obj: InitializeFanoutArgs2JSON): InitializeFanoutArgs2 {
    return new InitializeFanoutArgs2({
      epoch: obj.epoch,
      bull: obj.bull,
      bear: obj.bear,
    })
  }

  toEncodable() {
    return InitializeFanoutArgs2.toEncodable(this)
  }
}
