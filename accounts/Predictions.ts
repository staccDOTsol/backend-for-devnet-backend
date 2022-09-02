import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface PredictionsFields {
  bull: number
  bear: number
  epoch: number
  auth: PublicKey
}

export interface PredictionsJSON {
  bull: number
  bear: number
  epoch: number
  auth: string
}

export class Predictions {
  readonly bull: number
  readonly bear: number
  readonly epoch: number
  readonly auth: PublicKey

  static readonly discriminator = Buffer.from([
    123, 173, 204, 5, 158, 94, 182, 53,
  ])

  static readonly layout = borsh.struct([
    borsh.u8("bull"),
    borsh.u8("bear"),
    borsh.u32("epoch"),
    borsh.publicKey("auth"),
  ])

  constructor(fields: PredictionsFields) {
    this.bull = fields.bull
    this.bear = fields.bear
    this.epoch = fields.epoch
    this.auth = fields.auth
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<Predictions | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[]
  ): Promise<Array<Predictions | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(PROGRAM_ID)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): Predictions {
    if (!data.slice(0, 8).equals(Predictions.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Predictions.layout.decode(data.slice(8))

    return new Predictions({
      bull: dec.bull,
      bear: dec.bear,
      epoch: dec.epoch,
      auth: dec.auth,
    })
  }

  toJSON(): PredictionsJSON {
    return {
      bull: this.bull,
      bear: this.bear,
      epoch: this.epoch,
      auth: this.auth.toString(),
    }
  }

  static fromJSON(obj: PredictionsJSON): Predictions {
    return new Predictions({
      bull: obj.bull,
      bear: obj.bear,
      epoch: obj.epoch,
      auth: new PublicKey(obj.auth),
    })
  }
}
