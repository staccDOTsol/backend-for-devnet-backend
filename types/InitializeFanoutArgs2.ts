import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface InitializeFanoutArgs2Fields {
  bulls: number
  bears: number
  epochs: number
}

export interface InitializeFanoutArgs2JSON {
  bulls: number
  bears: number
  epochs: number
}

export class InitializeFanoutArgs2 {
  readonly bulls: number
  readonly bears: number
  readonly epochs: number

  constructor(fields: InitializeFanoutArgs2Fields) {
    this.bulls = fields.bulls
    this.bears = fields.bears
    this.epochs = fields.epochs
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u8("bulls"), borsh.u8("bears"), borsh.u8("epochs")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InitializeFanoutArgs2({
      bulls: obj.bulls,
      bears: obj.bears,
      epochs: obj.epochs,
    })
  }

  static toEncodable(fields: InitializeFanoutArgs2Fields) {
    return {
      bulls: fields.bulls,
      bears: fields.bears,
      epochs: fields.epochs,
    }
  }

  toJSON(): InitializeFanoutArgs2JSON {
    return {
      bulls: this.bulls,
      bears: this.bears,
      epochs: this.epochs,
    }
  }

  static fromJSON(obj: InitializeFanoutArgs2JSON): InitializeFanoutArgs2 {
    return new InitializeFanoutArgs2({
      bulls: obj.bulls,
      bears: obj.bears,
      epochs: obj.epochs,
    })
  }

  toEncodable() {
    return InitializeFanoutArgs2.toEncodable(this)
  }
}
