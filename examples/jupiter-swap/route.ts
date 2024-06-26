import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { actionSpecOpenApiPostRequestBody, actionsSpecOpenApiGetResponse, actionsSpecOpenApiPostResponse } from '../openapi';
import { ActionsSpecErrorResponse, ActionsSpecGetResponse, ActionsSpecPostRequestBody, ActionsSpecPostResponse } from '../../spec/actions-spec';
import { PublicKey, Keypair, SystemProgram, Connection, ComputeBudgetProgram, AddressLookupTableAccount, TransactionInstruction, TransactionMessage, VersionedTransaction, Transaction, VersionedMessage } from '@solana/web3.js';
import { createJupiterApiClient, QuoteGetRequest, SwapPostRequest } from '@jup-ag/api';
import fs from 'fs';
import { BN } from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import {createBurnInstruction, getAssociatedTokenAddressSync} from '@solana/spl-token'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createCollection, createV1, mplCore } from '@metaplex-foundation/mpl-core'
import OpenAI from 'openai';


import { CompiledAddressLookupTable, generateSigner, keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import { create } from '@metaplex-foundation/mpl-core'

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});// Use the RPC endpoint of your choice.
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'

const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URL as string).use(mplCore())
umi.use(irysUploader())

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string);
const providerKeypair = Keypair.fromSecretKey(bs58.decode(process.env.KEY as string))
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(providerKeypair.secretKey))
umi.use(keypairIdentity(keypair))

const jupiterApi = createJupiterApiClient();
const burnTokenAddress = 'StaccN8ycAamAmZgijj9B7wKHwUEF17XN3vrNx1pQ6Z';


const app = new OpenAPIHono();
import { createCanvas, loadImage } from 'canvas';
import { createPublicKey } from 'crypto';

const generateLeaderboardImage = async (data: any) => {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background color
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  // Text settings
  ctx.fillStyle = '#fff';
  ctx.font = '30px Arial';

  // Draw leaderboard data
  ctx.fillText(`Leader: ${data.leader == null ? "Nobody yet.." : data.leader.toString().slice(0, 6)}..`, 50, 100);
  const totalSol = await connection.getBalance(providerKeypair.publicKey)
  ctx.fillText(`Total $FOMO3d Burned: ${data.totalBurned}`, 50, 150);
  ctx.fillText(`Leader will win ${totalSol / 10 ** 9} SOL..`, 50, 200);
  const timeLeftInSeconds = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
  ctx.fillText(`..unless some1 else plays in ${Math.round(timeLeftInSeconds)} secs`, 50, 250);

  // Optionally, add more graphics or images
  // const image = await loadImage('path/to/image.png');
  // ctx.drawImage(image, 50, 300, 200, 200);

  const buffer = canvas.toBuffer();
  const base64Image = buffer.toString('base64');
  return base64Image;
};

const accountToCollectionMap = new Map<string, any[]>();


// You can add more accounts and collections as needed

app.openapi(
  createRoute({
    method: 'post',
    path: '/mint/{account}/{collection}',
    tags: ['FOMO3D'],
    request: {
      params: z.object({
        account: z.string().openapi({
          param: {
            name: 'account',
            in: 'path',
          },
          type: 'string',
          example: 'Czbmb7osZxLaX5vGHuXMS2mkdtZEXyTNKwsAUUpLGhkG',
        }),
        collection: z
          .string()
          .openapi({
            param: {
              name: 'collection',
              in: 'path',
            },
            type: 'string',
            example: 'Czbmb7osZxLaX5vGHuXMS2mkdtZEXyTNKwsAUUpLGhkG',
          }),

      }),
      body: actionSpecOpenApiPostRequestBody,
    },
    responses: actionsSpecOpenApiPostResponse,
  }),
  async (c) => {
    const collection = c.req.param('collection') as string;
    const theacc = c.req.param('account') as string;
    const collections = accountToCollectionMap.get(theacc) || []
    let tasty : any
    if (collections.length > 0){
    for (const coll of collections){
      if (coll.collection == collection){
        tasty = coll
      }
    }
    }
    const prompt = tasty.prompt || 'a man in a suit and a hat "manwifhat"';
    const image = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,

    });
    const image_url = image.data[0].url;
    
    const { account } = (await c.req.json()) as { account: string; solAmount: number };
    const assetSigner = generateSigner(umi)

const uri = await umi.uploader.uploadJson({
  name: `Blink MemeNFT by ${account.slice(0, 3)}...${account.slice(-3)}`,
  description: `This is an nft you can mint on a bonding curve on fomo3d.fun/${assetSigner.publicKey}`,
  image: image_url,
})
const created = await create(umi, {
  asset: assetSigner,
  collection: {
    publicKey: publicKey(collection), // why is this so hard
  },
  name: `Blink MemeNFT by ${account.slice(0, 3)}...${account.slice(-3)}`,
  uri: uri,
}).buildWithLatestBlockhash(umi)
const luts: any [] = []
for (const lut of created.message.addressLookupTables){
  const maybe =await connection.getAddressLookupTable(new PublicKey(lut.publicKey))
  if (maybe != undefined){

    luts.push(maybe)
  }
}
const godWhyIsThisSoDifficult = TransactionMessage.decompile(
  VersionedMessage.deserialize(created.serializedMessage),
  {
    addressLookupTableAccounts:luts})


    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    const messageV0 = new TransactionMessage({
      payerKey: providerKeypair.publicKey,
      recentBlockhash: created.message.blockhash,
      instructions: [
        ComputeBudgetProgram.setComputeUnitPrice({microLamports: 333000}),
        ...godWhyIsThisSoDifficult.instructions,
        SystemProgram.transfer(
          {
            fromPubkey: new PublicKey(account),
            toPubkey: new PublicKey(theacc),
            lamports: Math.floor(tasty.price * 10 ** 9)
          }
        ),SystemProgram.transfer(
          {
            fromPubkey: new PublicKey(account),
            toPubkey: providerKeypair.publicKey,
            lamports: Math.floor(tasty.price * 10 ** 9 / 10000)
          }
        ),
      ],
    }).compileToV0Message(luts);
    // 
    const transaction = new VersionedTransaction(messageV0);
    if (collections) {
      collections.forEach(collection => {
        if (tasty.collection == collection.collection){
        collection.price *= 1.01;
        }
      });
    }
transaction.sign([Keypair.fromSecretKey(assetSigner.secretKey)])
    const response: ActionsSpecPostResponse = {
      redirect: `/collections/${account}`,
      transaction: Buffer.from(transaction.serialize()).toString('base64')
    };
    return c.json(response);
  },
);

app.openapi(
  createRoute({
    method: 'post',
    path: '/collections/{account}',
    tags: ['FOMO3D'],
    request: {
      params: z.object({
        account: z.string().openapi({
          param: {
            name: 'account',
            in: 'path',
          },
          type: 'string',
          example: 'Czbmb7osZxLaX5vGHuXMS2mkdtZEXyTNKwsAUUpLGhkG',
        }),
      }),
      body: actionSpecOpenApiPostRequestBody,
    },
    responses: actionsSpecOpenApiPostResponse,
  }),
  async (c) => {
    const account = c.req.param('account');
    const collections = accountToCollectionMap.get(account);
    const response: ActionsSpecGetResponse = {
      icon: collections? collections[0].image : 'https://prod-image-cdn.tensor.trade/images/90x90/freeze=false/https%3A%2F%2Farweave.net%2FKBP_WiZet6YWoAz7S2pMgHnXHr2-sF8P0RLZu2tAqAM',
      label: `Meme NFTs`,
      title: `Meme NFTs`,
      description: `Smash the button below to mint this beauty!`,
      links: {
        actions: collections? collections.map((collection) => [
          {
            label: `Mint an NFT on a bonding curve: ${collection.price} SOL`,
            href: `/mint/${account}/${collection.collection}`,
          
          },

        ]).flat() : []

      },
    };
    return c.json(response);
  },
);

app.openapi(
  createRoute({
    method: 'post',
    path: '/mintCollection/{prompt}',
    tags: ['FOMO3D'],
    request: {
      params: z.object({
        prompt: z.string().openapi({
          param: {
            name: 'prompt',
            in: 'path',
          },
          type: 'string',
          example: 'a man in a suit and a hat "manwifhat"',
        }),
      }),
      body: actionSpecOpenApiPostRequestBody,
    },
    responses: actionsSpecOpenApiPostResponse,
  }),
  async (c) => {
    const prompt = c.req.param('prompt');

    const { account } = (await c.req.json()) as { account: string };
const solAmount = 0.04 * 10 ** 9

    const userPublicKey = new PublicKey(account);
   
    const image = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,

    });
    const image_url = image.data[0].url;
    console.log(image_url)

const assetSigner = generateSigner(umi)

const uri = await umi.uploader.uploadJson({
  name: `Blink MemeNFT by ${account.slice(0, 3)}...${account.slice(-3)}`,
  description: `This is an nft you can mint on a bonding curve on fomo3d.fun/${assetSigner.publicKey}`,
  image: image_url,
})
const created = await createCollection(umi, {
  collection: assetSigner,
  name: `Blink Collection MemeNFT by ${account.slice(0, 3)}...${account.slice(-3)}`,
  uri: uri,
}).buildWithLatestBlockhash(umi)
accountToCollectionMap.set(account, [...accountToCollectionMap.get(account) || [], {account:account, collection:assetSigner.publicKey, price: 0.01, image: image_url, prompt}])
const luts: any [] = []
for (const lut of created.message.addressLookupTables){
  const maybe =await connection.getAddressLookupTable(new PublicKey(lut.publicKey))
  if (maybe != undefined){

    luts.push(maybe)
  }
}
const godWhyIsThisSoDifficult = TransactionMessage.decompile(
  VersionedMessage.deserialize(created.serializedMessage),
  {
    addressLookupTableAccounts:luts})


    const messageV0 = new TransactionMessage({
      payerKey: providerKeypair.publicKey,
      recentBlockhash:  created.message.blockhash,
      instructions: [
        ...godWhyIsThisSoDifficult.instructions,
        ComputeBudgetProgram.setComputeUnitPrice({microLamports: 333000}),
        SystemProgram.transfer(
          {
            fromPubkey: new PublicKey(account),
            toPubkey: providerKeypair.publicKey,
            lamports: solAmount * 2
          }
        ),
      ],
    }).compileToV0Message(luts);
   
    const transaction = new VersionedTransaction(messageV0);
transaction.sign([Keypair.fromSecretKey(assetSigner.secretKey)])
    const response: ActionsSpecPostResponse = {
      redirect: `/collections/${account}`,
      transaction: Buffer.from(transaction.serialize()).toString('base64')
    };
    return c.json(response);
  },
);

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['FOMO3D'],
    responses: actionsSpecOpenApiGetResponse,
  }),
  async (c) => {
    const promptParamaterName = 'prompt';
const accountParamaterName = 'account';
const collections = Array.from(accountToCollectionMap.values()).flat()
    const response: ActionsSpecGetResponse = {
      icon: collections.length > 0? collections[collections.length-1].image : 'https://prod-image-cdn.tensor.trade/images/90x90/freeze=false/https%3A%2F%2Farweave.net%2FKBP_WiZet6YWoAz7S2pMgHnXHr2-sF8P0RLZu2tAqAM',
      label: `Meme NFTs`,
      title: `Meme NFTs`,
      description: `Smash the button below and generate a dall-e-2 image for your collection.. then share your blink url for people to mint into your collection on a bonding curve!`,
      links: {
        actions: [{
            label: `Mint Collection`,
            href: `/mintCollection/${promptParamaterName}`,
          parameters: [
            {
              name: promptParamaterName,
              label: 'pg13 prompt!',
            },
          ],
        
            },{
        label: 'Mint nfts',
        href: `/collections/${accountParamaterName}`,
        parameters: [
          {
            name: accountParamaterName,
            label: 'user addy',
          },
        ],
        }
        ]
      },
    };
    collections.length > 0 && response && response.links && response.links.actions.push(...[{
      label: 'Mint 1st nft',
      href: `/mint/${collections[0].account}/${collections[0].collection}`,
    
      },{
        label: 'Mint Most Recent nft',
        href: `/mint/${collections[collections.length-1].account}/${collections[collections.length-1].collection}`,
      
        }]) 
    
    return c.json(response);
  },
);

export default app;