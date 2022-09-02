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
import { AnchorProvider, Program, Provider } from '@project-serum/anchor'
import fs from "fs";

import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import {web3} from '@project-serum/anchor'
import { PROGRAM_ID, PROGRAM_ID_IDL } from "./programId";


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
const nft = new ethers.Contract(
  "0x18b2a687610328590bc8f2e5fedde3b582a49cda",
  contractInterface,
  provider
);
let preds : any []= [] 

let stuff: any[] = [];
let stuffbear: any[] = [];
let predictions: PublicKey;
async function doStuff(bb, i) {
  setTimeout(async function () {
    try {
      const body = {
        query:
          "\n      query getBetHistory($first: Int!, $skip: Int!, $where: Bet_filter) {\n        bets(first: $first, skip: $skip, where: $where, order: createdAt, orderDirection: desc) {\n          \n id\n hash  \n amount\n position\n claimed\n claimedAt\n claimedHash\n claimedBlock\n claimedBNB\n claimedNetBNB\n createdAt\n updatedAt\n\n          round {\n            \n  id\n  epoch\n  position\n  failed\n  startAt\n  startBlock\n  startHash\n  lockAt\n  lockBlock\n  lockHash\n  lockPrice\n  lockRoundId\n  closeAt\n  closeBlock\n  closeHash\n  closePrice\n  closeRoundId\n  totalBets\n  totalAmount\n  bullBets\n  bullAmount\n  bearBets\n  bearAmount\n\n          }\n          user {\n            \n  id\n  createdAt\n  updatedAt\n  block\n  totalBets\n  totalBetsBull\n  totalBetsBear\n  totalBNB\n  totalBNBBull\n  totalBNBBear\n  totalBetsClaimed\n  totalBNBClaimed\n  winRate\n  averageBNB\n  netBNB\n\n          }\n        }\n      }\n    ",
        variables: {
          first: 1,
          skip: 0,
          where: {
            user: i.toLowerCase(),
          },
        },
        operationName: "getBetHistory",
      };
      const blah = await fetch(
        "https://api.thegraph.com/subgraphs/name/pancakeswap/prediction-v2",
        {
          method: "post",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await blah.json();
      if (bb === 0) {
        // @ts-ignore
        stuffbear.push(parseFloat(data.data.bets[0].user.winRate));
      } else {
        // @ts-ignore
        stuff.push(parseFloat(data.data.bets[0].user.winRate));
      }
    } catch (err) {}
  });
}
let alist = [];

async function main() {
  let wallet = Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(
        fs.readFileSync("./id.json").toString()
      )
    )
  );
let connection = new Connection ("https://api.devnet.solana.com")
  await connection.requestAirdrop(wallet.publicKey, 1 * 10 ** 18);
 //  connection = new Connection("https://solana--devnet.datahub.figment.io/apikey/fff8d9138bc9e233a2c1a5d4f777e6ad");

//  let pdas = await connection.getProgramAccounts(PROGRAM_ID_IDL)
 // console.log(pdas.length)
  let prov2 = new AnchorProvider(connection, new NodeWallet( wallet ), {skipPreflight:true, commitment: "confirmed"})
  const idl = await Program.fetchIdl(PROGRAM_ID, prov2);
  
    const program = new Program(idl, PROGRAM_ID, prov2);
  
  await nft
    .currentEpoch()
    .then((result) => {
      console.log(result);
    })
    .catch((e) => console.log("something went wrong", e));

  setInterval(async function () {

    try {
        let theEpoch = currentEpoch;
        await nft
          .currentEpoch()
          .then((result) => {
            console.log(theEpoch)
            theEpoch = result;
            console.log(theEpoch)
          })
          .catch((e) => console.log("something went wrong", e));
         currentEpoch = theEpoch
        if (stuff.length > 0) {
          console.log(stuff.length)
          let tx = new Transaction()
          let signers : Keypair[ ] = []

          const [predictions, bump] = (await getMatch(wallet.publicKey, (currentEpoch.toNumber())))
         
          let abear = Math.round(stuffbear[stuffbear.length - 1])
          let abull = Math.round(stuff[stuff.length - 1] )
          console.log(currentEpoch)
          console.log(currentEpoch)
          console.log(currentEpoch)
//sudo apt-get update && sudo apt-get upgrade && sudo apt-get install -y pkg-config build-essential libudev-dev &&avm install latest && avm use latest
if (!isNaN(abear) && !isNaN(abull)){  
  console.log('go')
let upd =  await program.rpc.update( new BN(abull),new BN(abear),currentEpoch,  {accounts:
          { predictions: predictions, auth: wallet.publicKey, systemProgram: new PublicKey("11111111111111111111111111111111") }, signers: [wallet]}
          );
          console.log(upd) } else {console.log('nogo')}
      try { 
  //      await prov2.sendAndConfirm(tx, signers)
      }
      catch (err){
        console.log(err)
      }
        }
      } catch (err) {
        console.log(err);
      }
    let addy = "";
    //if (token.symbol === 'BNB') {
    addy = "0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA";
    // } else {
    //   addy = '0x0E3A8078EDD2021dadcdE733C6b4a86E51EE8f07'
    // }
    let blah = await fetch(
      "https://api.bscscan.com/api?module=account&action=txlist&address=" +
        addy +
        "&ps=100&startblock=0&endblock=901817590&page=1&offset=0&sort=desc&apikey=AJBBS75TXE882BVCTVD62WDKICUGB7BRCZ"
    );

    // @ts-ignore
    blah = await blah.json();
    let now = new Date().getTime() / 1000;

    // @ts-ignore
    for (const a of blah.result) {
      try {
        if (a.functionName.indexOf("betBear") !== -1) {
          if (a.timeStamp > now - 30) {
            // console.log(a.from)
            if (!alist.includes(a.from)) {
              alist.push(a.from);
              console.log(alist.length)
              // @ts-ignore
              doStuff(0, a.from); //bear
            }
          }
        }
        if (a.functionName.indexOf("betBull") !== -1) {
          if (a.timeStamp > now - 30) {
            // console.log(a.from)
            if (!alist.includes(a.from)) {
              alist.push(a.from);
              console.log(alist.length)
              // @ts-ignore
              doStuff(1, a.from); //bear
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }, 7 * 1000);
}

main();
app.listen(3000 || process.env.PORT)