import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { actionSpecOpenApiPostRequestBody, actionsSpecOpenApiGetResponse, actionsSpecOpenApiPostResponse } from '../openapi';
import { ActionsSpecErrorResponse, ActionsSpecGetResponse, ActionsSpecPostRequestBody, ActionsSpecPostResponse } from '../../spec/actions-spec';
import { Program, Provider, Idl, web3, BN, AnchorProvider, Wallet, LangErrorCode } from '@coral-xyz/anchor';
import { ComputeBudgetProgram, Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartType } from 'chart.js';
const fetch = require('node-fetch');
const sharp = require('sharp');
import FormData from 'form-data';

const idl = {
  "version": "0.1.0",
  "name": "pump",
  "instructions": [
    {
      "name": "initialize",
      "docs": [
        "Creates the global state."
      ],
      "accounts": [
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setParams",
      "docs": [
        "Sets the global state parameters."
      ],
      "accounts": [
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "feeRecipient",
          "type": "publicKey"
        },
        {
          "name": "initialVirtualTokenReserves",
          "type": "u64"
        },
        {
          "name": "initialVirtualSolReserves",
          "type": "u64"
        },
        {
          "name": "initialRealTokenReserves",
          "type": "u64"
        },
        {
          "name": "tokenTotalSupply",
          "type": "u64"
        },
        {
          "name": "feeBasisPoints",
          "type": "u64"
        }
      ]
    },
    {
      "name": "create",
      "docs": [
        "Creates a new coin and bonding curve."
      ],
      "accounts": [
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "global",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplTokenMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "buy",
      "docs": [
        "Buys tokens from a bonding curve."
      ],
      "accounts": [
        {
          "name": "global",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeRecipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "maxSolCost",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sell",
      "docs": [
        "Sells tokens into a bonding curve."
      ],
      "accounts": [
        {
          "name": "global",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeRecipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "minSolOutput",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "docs": [
        "Allows the admin to withdraw liquidity for a migration once the bonding curve completes"
      ],
      "accounts": [
        {
          "name": "global",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Global",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feeRecipient",
            "type": "publicKey"
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "initialVirtualSolReserves",
            "type": "u64"
          },
          {
            "name": "initialRealTokenReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "feeBasisPoints",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "BondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "realTokenReserves",
            "type": "u64"
          },
          {
            "name": "realSolReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateEvent",
      "fields": [
        {
          "name": "name",
          "type": "string",
          "index": false
        },
        {
          "name": "symbol",
          "type": "string",
          "index": false
        },
        {
          "name": "uri",
          "type": "string",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bondingCurve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TradeEvent",
      "fields": [
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "isBuy",
          "type": "bool",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "virtualSolReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "virtualTokenReserves",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "CompleteEvent",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bondingCurve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "SetParamsEvent",
      "fields": [
        {
          "name": "feeRecipient",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "initialVirtualTokenReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "initialVirtualSolReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "initialRealTokenReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenTotalSupply",
          "type": "u64",
          "index": false
        },
        {
          "name": "feeBasisPoints",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotAuthorized",
      "msg": "The given account is not authorized to execute this instruction."
    },
    {
      "code": 6001,
      "name": "AlreadyInitialized",
      "msg": "The program is already initialized."
    },
    {
      "code": 6002,
      "name": "TooMuchSolRequired",
      "msg": "slippage: Too much SOL required to buy the given amount of tokens."
    },
    {
      "code": 6003,
      "name": "TooLittleSolReceived",
      "msg": "slippage: Too little SOL received to sell the given amount of tokens."
    },
    {
      "code": 6004,
      "name": "MintDoesNotMatchBondingCurve",
      "msg": "The mint does not match the bonding curve."
    },
    {
      "code": 6005,
      "name": "BondingCurveComplete",
      "msg": "The bonding curve has completed and liquidity migrated to raydium."
    },
    {
      "code": 6006,
      "name": "BondingCurveNotComplete",
      "msg": "The bonding curve has not completed."
    },
    {
      "code": 6007,
      "name": "NotInitialized",
      "msg": "The program is not initialized."
    }
  ],
  "metadata": {
    "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
  }
}
import 'chartjs-adapter-date-fns'; // Import the date adapter
import path from 'path';

// Connection and program setup
const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string);
const feeRecipient = new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");
const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
const provider = new AnchorProvider(connection, new Wallet(Keypair.generate()), {});
const program = new Program(idl as Idl, new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"), provider);


const SWAP_AMOUNT_USD_OPTIONS = [0.1, 1, 5];
// Function to fetch the latest Pump.fun coin
const getLatestPumpFunCoin = async () => {
  const response = await fetch('https://frontend-api.pump.fun/coins/latest');
  const data = await response.json();
  return data;
};

// Function to fetch the King of the Hill Pump.fun coin
const getKingOfTheHillCoin = async () => {
  const response = await fetch('https://frontend-api.pump.fun/coins/king-of-the-hill?includeNsfw=true');
  const data = await response.json();
  return data;
};

// Function to fetch candlestick data for a given mint
const getCandlestickData = async (mint: string) => {
  const response = await fetch(`https://frontend-api.pump.fun/candlesticks/${mint}?offset=0&limit=1000&timeframe=1`);
  const data = await response.json();
  return data;
};

// Chart generation setup
const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

const generateCandlestickChart = async (mint: any, candlestickData: any) => {


  const labels = candlestickData.map((item: any) => new Date(item.timestamp * 1000).toLocaleDateString());
  const data = candlestickData.map((item: any) => ({
    x: new Date(item.timestamp * 1000),
    o: item.open,
    h: item.high,
    l: item.low,
    c: item.close,
  }));

  const configuration = {
    type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Candlestick Data',
      data: data.map(item => item.c),
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      fill: false,
    }],
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
        },
      },
    },
  }
}
// @ts-ignore
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  return image;
};

const app = new OpenAPIHono();

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Degen Swap'],
    request: {

    },
    responses: actionsSpecOpenApiGetResponse,
  }),
  async (c) => {

    const latestCoin = await getLatestPumpFunCoin();
    const kothCoin = await getKingOfTheHillCoin();
    const amountParameterName = 'amount';
    const dt = new Date().getTime();
    const candlestickData = await getCandlestickData(latestCoin.mint);
    const candlestickData2 = await getCandlestickData(kothCoin.mint);

    const image1 = await generateCandlestickChart(latestCoin.mint, candlestickData);
    const image2 = await generateCandlestickChart(kothCoin.mint, candlestickData2);

    // Combine images side-by-side
    const combinedImage = await sharp({
      create: {
        width: width * 2,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    })
      .composite([
        { input: image1, left: 0, top: 0 },
        { input: image2, left: width, top: 0 }
      ])
      .toBuffer();
      
    const imgurClientId = '06f787d29bb77bf';
    const imgurClientSecret = 'f2966431bf8f496742a06d6ed36431c31a760f0e';
    const imgurUploadUrl = 'https://api.imgur.com/3/image';
    fs.writeFileSync(dt.toString() + 'img.png', combinedImage)
    const formData = new FormData();
    formData.append('image', fs.createReadStream(dt.toString() + 'img.png'));
    formData.append('type', 'image');
    formData.append('title', 'Simple upload');
    formData.append('description', 'This is a simple image upload in Imgur');

    const r = await fetch(imgurUploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${imgurClientId}`,
      },
      body: formData,
    });

    const imgurData = await r.json();
    console.log(imgurData)


    const imgurData = await r.json();
    console.log(imgurData)
    const filePath = imgurData.data.link;
    const response: ActionsSpecGetResponse = {
      icon: filePath,
      label: `Swap ${kothCoin.name} or ${latestCoin.name}`,
      title: `Swap ${kothCoin.name} or ${latestCoin.name}`,
      description: `Swap ${kothCoin.name} or ${latestCoin.name} with SOL. Choose a SOL amount of either from the options below, or enter a custom amount.`,
      links: {
        actions: [
          ...SWAP_AMOUNT_USD_OPTIONS.map((amount) => ({
            label: `${amount} ${kothCoin.name}`,
            href: `/buy/${kothCoin.mint}/${Math.floor(amount / candlestickData2[candlestickData2.length-1].close)}`,
          })),
          ...SWAP_AMOUNT_USD_OPTIONS.map((amount) => ({
            label: `${amount} ${latestCoin.name}`,
            href: `/buy/${latestCoin.mint}/${Math.floor(amount / candlestickData[candlestickData.length-1].close)}`,
          }))
        ]
      },
    };

    return c.json(response);
  },
);
import fs from 'fs'
app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Degen Swap'],
    request: {
      params: z.object({
        coin: z.string()
      }),
    },
    responses: actionsSpecOpenApiGetResponse,
  }),
  async (c) => {
    const mint = c.req.param('coin');
    const amountParameterName = 'amount';
    const dt = new Date().getTime();
    const candlestickData = await getCandlestickData(mint as string);

    const image1 = await generateCandlestickChart(mint, candlestickData);

    // Ensure the public directory exists
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    const imgurClientId = '06f787d29bb77bf';
    const imgurClientSecret = 'f2966431bf8f496742a06d6ed36431c31a760f0e';
    const imgurUploadUrl = 'https://api.imgur.com/3/image';
    fs.writeFileSync(dt.toString() + 'img.png', image1)
    const formData = new FormData();
    formData.append('image', fs.createReadStream(dt.toString() + 'img.png'));
    formData.append('type', 'image');
    formData.append('title', 'Simple upload');
    formData.append('description', 'This is a simple image upload in Imgur');

    const r = await fetch(imgurUploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${imgurClientId}`,
      },
      body: formData,
    });

    const imgurData = await r.json();
    console.log(imgurData)

    const filePath = imgurData.data.link;
    const coin = await(await fetch("https://frontend-api.pump.fun/coins/"+mint)).json()
    const response: ActionsSpecGetResponse = {
      icon: filePath,
      label: `Swap ${coin.name}`,
      title: `Swap ${coin.name}`,
      description: `Swap ${coin.name} with SOL. Choose a SOL amount of either from the options below, or enter a custom amount.`,
      links: {
        actions: [
          ...SWAP_AMOUNT_USD_OPTIONS.map((amount) => ({
            label: `${amount}`,
            href: `/buy/${coin.mint}/${amount}`,
          })),
          {
            href: `/buy/${coin.mint}/{${amountParameterName}}`,
            label: `Buy ${coin.name}`,
            parameters: [
              {
                name: amountParameterName,
                label: 'Enter a custom USD amount',
              },
            ],
          },
          {
            href: `/sell/${coin.mint}/{${amountParameterName}}`,
            label: `Sell ${coin.name}`,
            parameters: [
              {
                name: amountParameterName,
                label: 'Enter a custom USD amount',
              },
            ],
          },
        ],
      },
    };

    return c.json(response);
  },
);


app.openapi(
  createRoute({
    method: 'post',
    path: '/buy/{tokenPair}/{amount}',
    tags: ['Pump Buy'],
    request: {
      params: z.object({
        tokenPair: z.string().openapi({
          param: {
            name: 'tokenPair',
            in: 'path',
          },
          type: 'string',
          example: 'DJRgUnw19oBtgchjsDLed3h6PHFH3NcwxcmzAgsfpump',
        }),
        amount: z
          .string()
          .optional()
          .openapi({
            param: {
              name: 'amount',
              in: 'path',
              required: false,
            },
            type: 'number',
            example: '1',
          }),
      }),
      body: actionSpecOpenApiPostRequestBody,
    },
    responses: actionsSpecOpenApiPostResponse,
  }),
  async (c) => {
    
    const mint = c.req.param('tokenPair');
    const amount = c.req.param('amount') ?? "1";
    const { account } = (await c.req.json()) as ActionsSpecPostRequestBody;
    const maxSolCost = Number.MAX_SAFE_INTEGER;
    const mintPublicKey = new PublicKey(mint);
    const userPublicKey = new PublicKey(account);

    const bondingCurvePublicKey = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding-curve'), mintPublicKey.toBuffer()],
      program.programId
    )[0];

    const associatedBondingCurvePublicKey = getAssociatedTokenAddressSync(
      mintPublicKey,
      bondingCurvePublicKey,
      true
    );

    const transaction = await program.methods.buy(new BN(Number(amount) * 10 ** 6), new BN(maxSolCost)).accounts({
      global,
      feeRecipient,
      mint: mintPublicKey,
      bondingCurve: bondingCurvePublicKey,
      associatedBondingCurve: associatedBondingCurvePublicKey,
      associatedUser: await getAssociatedTokenAddressSync(mintPublicKey, userPublicKey),
      user: userPublicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 333333 }),
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: new PublicKey("Czbmb7osZxLaX5vGHuXMS2mkdtZEXyTNKwsAUUpLGhkG"),
          lamports: 0.01 * 10 ** 9,
        }),
      ])
      .transaction();

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });

    const response: ActionsSpecPostResponse = {
      transaction: bs58.encode(serializedTransaction),
    };
    return c.json(response);
  },
);

app.openapi(
  createRoute({
    method: 'post',
    path: '/sell/{tokenPair}/{amount}',
    tags: ['Pump Sell'],
    request: {
      params: z.object({
        tokenPair: z.string().openapi({
          param: {
            name: 'tokenPair',
            in: 'path',
          },
          type: 'string',
          example: 'DJRgUnw19oBtgchjsDLed3h6PHFH3NcwxcmzAgsfpump',
        }),
        amount: z
          .string()
          .optional()
          .openapi({
            param: {
              name: 'amount',
              in: 'path',
              required: false,
            },
            type: 'number',
            example: '1',
          }),
      }),
      body: actionSpecOpenApiPostRequestBody,
    },
    responses: actionsSpecOpenApiPostResponse,
  }),
  async (c) => {
    
    const mint = c.req.param('tokenPair');
    const amount = c.req.param('amount') ?? "1";
    const { account } = (await c.req.json()) as ActionsSpecPostRequestBody;
    const minSolOutput = 0;
    const mintPublicKey = new PublicKey(mint);
    const userPublicKey = new PublicKey(account);


    const bondingCurvePublicKey = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding-curve'), mintPublicKey.toBuffer()],
      program.programId
    )[0];

    const associatedBondingCurvePublicKey = getAssociatedTokenAddressSync(
      mintPublicKey,
      bondingCurvePublicKey,
      true
    );

    const transaction = await program.methods.sell(new BN(Number(amount) * 10 ** 6), new BN(minSolOutput)).accounts({
      global,
      feeRecipient,
      mint: mintPublicKey,
      bondingCurve: bondingCurvePublicKey,
      associatedBondingCurve: associatedBondingCurvePublicKey,
      associatedUser: await getAssociatedTokenAddressSync(mintPublicKey, userPublicKey),
      user: userPublicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 333333 }),
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: new PublicKey("Czbmb7osZxLaX5vGHuXMS2mkdtZEXyTNKwsAUUpLGhkG"),
          lamports: 0.01 * 10 ** 9,
        }),
      ])
      .transaction();

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });

    const response: ActionsSpecPostResponse = {
      transaction: bs58.encode(serializedTransaction),
    };
    return c.json(response);
  },
);

export default app;
