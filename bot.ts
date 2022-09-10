// @ts-nocheck

import express from 'express'
import { update } from "./instructions";
import BN from "bn.js";
require("dotenv").config();
import {
  Account,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import fetch from "node-fetch";
import { Predictions } from './accounts'
import { AnchorProvider, Program, Provider } from '@project-serum/anchor'
import fs from "fs";

import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import {web3} from '@project-serum/anchor'
import { PROGRAM_ID, PROGRAM_ID_IDL } from "./programId";
import { RLP } from 'ethers/lib/utils';


const app = new express() 
export const getMatch = async (
  me: web3.PublicKey,
  epoch: number
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [Buffer.from("pancake"), me.toBuffer(), new Uint8Array([epoch])],
    PROGRAM_ID
  );
};

const contractInterface = [
  {
    inputs: [
      { internalType: "address", name: "_oracleAddress", type: "address" },
      { internalType: "address", name: "_adminAddress", type: "address" },
      { internalType: "address", name: "_operatorAddress", type: "address" },
      { internalType: "uint256", name: "_intervalSeconds", type: "uint256" },
      { internalType: "uint256", name: "_bufferSeconds", type: "uint256" },
      { internalType: "uint256", name: "_minBetAmount", type: "uint256" },
      {
        internalType: "uint256",
        name: "_oracleUpdateAllowance",
        type: "uint256",
      },
      { internalType: "uint256", name: "_treasuryFee", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BetBear",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BetBull",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Claim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      { indexed: false, internalType: "int256", name: "price", type: "int256" },
    ],
    name: "EndRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      { indexed: false, internalType: "int256", name: "price", type: "int256" },
    ],
    name: "LockRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "NewAdminAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "bufferSeconds",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "intervalSeconds",
        type: "uint256",
      },
    ],
    name: "NewBufferAndIntervalSeconds",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minBetAmount",
        type: "uint256",
      },
    ],
    name: "NewMinBetAmount",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "NewOperatorAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oracle",
        type: "address",
      },
    ],
    name: "NewOracle",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oracleUpdateAllowance",
        type: "uint256",
      },
    ],
    name: "NewOracleUpdateAllowance",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasuryFee",
        type: "uint256",
      },
    ],
    name: "NewTreasuryFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
    ],
    name: "Pause",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardBaseCalAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasuryAmount",
        type: "uint256",
      },
    ],
    name: "RewardsCalculated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
    ],
    name: "StartRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokenRecovery",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TreasuryClaim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
    ],
    name: "Unpause",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_TREASURY_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "adminAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "epoch", type: "uint256" }],
    name: "betBear",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "epoch", type: "uint256" }],
    name: "betBull",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "bufferSeconds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256[]", name: "epochs", type: "uint256[]" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "epoch", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "claimable",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentEpoch",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "executeRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "genesisLockOnce",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "genesisLockRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "genesisStartOnce",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "genesisStartRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "cursor", type: "uint256" },
      { internalType: "uint256", name: "size", type: "uint256" },
    ],
    name: "getUserRounds",
    outputs: [
      { internalType: "uint256[]", name: "", type: "uint256[]" },
      {
        components: [
          {
            internalType: "enum PancakePredictionV2.Position",
            name: "position",
            type: "uint8",
          },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "bool", name: "claimed", type: "bool" },
        ],
        internalType: "struct PancakePredictionV2.BetInfo[]",
        name: "",
        type: "tuple[]",
      },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserRoundsLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "intervalSeconds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "ledger",
    outputs: [
      {
        internalType: "enum PancakePredictionV2.Position",
        name: "position",
        type: "uint8",
      },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bool", name: "claimed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minBetAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "operatorAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracle",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracleLatestRoundId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracleUpdateAllowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "recoverToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "epoch", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "refundable",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "rounds",
    outputs: [
      { internalType: "uint256", name: "epoch", type: "uint256" },
      { internalType: "uint256", name: "startTimestamp", type: "uint256" },
      { internalType: "uint256", name: "lockTimestamp", type: "uint256" },
      { internalType: "uint256", name: "closeTimestamp", type: "uint256" },
      { internalType: "int256", name: "lockPrice", type: "int256" },
      { internalType: "int256", name: "closePrice", type: "int256" },
      { internalType: "uint256", name: "lockOracleId", type: "uint256" },
      { internalType: "uint256", name: "closeOracleId", type: "uint256" },
      { internalType: "uint256", name: "totalAmount", type: "uint256" },
      { internalType: "uint256", name: "bullAmount", type: "uint256" },
      { internalType: "uint256", name: "bearAmount", type: "uint256" },
      { internalType: "uint256", name: "rewardBaseCalAmount", type: "uint256" },
      { internalType: "uint256", name: "rewardAmount", type: "uint256" },
      { internalType: "bool", name: "oracleCalled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_adminAddress", type: "address" },
    ],
    name: "setAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_bufferSeconds", type: "uint256" },
      { internalType: "uint256", name: "_intervalSeconds", type: "uint256" },
    ],
    name: "setBufferAndIntervalSeconds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_minBetAmount", type: "uint256" },
    ],
    name: "setMinBetAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_operatorAddress", type: "address" },
    ],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_oracle", type: "address" }],
    name: "setOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_oracleUpdateAllowance",
        type: "uint256",
      },
    ],
    name: "setOracleUpdateAllowance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_treasuryFee", type: "uint256" },
    ],
    name: "setTreasuryFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "userRounds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
// https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html#provider-object
let provider = ethers.provider;
//let provider = new ethers.providers.AlchemyProvider(56, "ZJpzOvIi5Z0K9uCxKITeC2xlWwdt6S-h");

let currentEpoch = new BN(0);
// https://docs.ethers.io/v5/api/contract/contract
const privateKey = `0x29f5f70abd54a593d91ee115f49b2cdd258e89ddc8e26f6248724a3932f452da`;
const wallet = new ethers.Wallet(privateKey);

const signer = wallet.connect(provider);
const nft = new ethers.Contract(
  "0x18b2a687610328590bc8f2e5fedde3b582a49cda",
  contractInterface,
  signer
);
let preds : any []= [] 

let stuff = 0
let stuffbear = 0
let predictions: PublicKey;
let alist: any = []
async function main() {
  let wallet = Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(
        fs.readFileSync("./key.json").toString()
      )
    )                   
  );
  let thei = 4
let connection = new Connection ("https://solana--devnet.datahub.figment.io/apikey/fff8d9138bc9e233a2c1a5d4f777e6ad")
  //await connection.requestAirdrop(wallet.publicKey, 1 * 10 ** 18);
 //  connection = new Connection("https://solana--devnet.datahub.figment.io/apikey/fff8d9138bc9e233a2c1a5d4f777e6ad");

// let pdas = await connection.getProgramAccounts(PROGRAM_ID_IDL)
 let whas : any [] = []
let w = 0 
let l = 0
await nft
.currentEpoch()
.then(async (eee) => {
for (var pda of pdas){
 let wha = await Predictions.fetch(connection, pda.pubkey)

if (wha.epoch == eee){
  //console.log(wha)
  if (true){
        //up 
        var exp = ethers.BigNumber.from("10").pow(16);
const supply = Math.ceil((await provider.getBalance(signer.address)) / 10);


console.log(wha)
        if (wha.kbear > wha.kbull + thei && wha.kbear > 63&& wha?.kbull >= 50){
          console.log('bear')
          await nft.betBear( eee,{value:supply, })
          setTimeout(async function(){

            await nft.claim(eee)
                      }, 60 * 1000 * 16)
        }
        else if (wha.kbull > wha.kbear + thei && wha.kbull > 63&& wha?.kbear >= 50){
          console.log('bull')

          await nft.betBull( eee,{value:supply, })
          setTimeout(async function(){

await nft.claim(eee)
          }, 60 * 1000 * 16)
        }
    
}
 }}
})
.catch((e) => console.log("something went wrong", e));

 console.log('wins: ' + w.toString())
 console.log('losses: ' + l.toString())
 console.log('ratio boyee: ' + (w / l).toString())
 
console.log(whas.length)
setTimeout(async function(){
  main()
}, 5.5 * 60000)
}
main();