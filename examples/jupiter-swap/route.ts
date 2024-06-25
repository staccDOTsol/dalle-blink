import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { actionSpecOpenApiPostRequestBody, actionsSpecOpenApiGetResponse, actionsSpecOpenApiPostResponse } from '../openapi';
import { ActionsSpecErrorResponse, ActionsSpecGetResponse, ActionsSpecPostRequestBody, ActionsSpecPostResponse } from '../../spec/actions-spec';
import { PublicKey, Keypair, SystemProgram, Connection, ComputeBudgetProgram, AddressLookupTableAccount, TransactionInstruction, TransactionMessage, VersionedTransaction, Transaction } from '@solana/web3.js';
import { createJupiterApiClient, QuoteGetRequest, SwapPostRequest } from '@jup-ag/api';
import fs from 'fs';
import { BN } from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import {createBurnInstruction, getAssociatedTokenAddressSync} from '@solana/spl-token'
const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string);
const providerKeypair = Keypair.fromSecretKey(bs58.decode(process.env.KEY as string))
const jupiterApi = createJupiterApiClient();
const burnTokenAddress = 'StaccN8ycAamAmZgijj9B7wKHwUEF17XN3vrNx1pQ6Z';

// Function to upload image to Imgur with caching
const cache = new Map();

const uploadImageToImgur = async (image: string) => {
  if (cache.has(image)) {
    console.log('Returning cached image link');
    return cache.get(image);
  }

  try {
    const response = await Imgur.upload({
      image,
      type: "base64"
    });
    console.log(response.data);
    const link = response.data.link;
    cache.set(image, link);
    return link;
  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    throw error;
  }
};

const gameState = {
  leader: null as PublicKey | null,
  endTime: Date.now() + 3600000,
  lastSol: 100_00_000,
  totalBurned: 0,
};

const app = new OpenAPIHono();
import { createCanvas, loadImage } from 'canvas';

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
  ctx.fillText(`Total $manifestoBurned: ${data.totalBurned}`, 50, 150);
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

const resetGame = async (winner: PublicKey) => {
  // Send SOL to the winner and reset the game state.
  // Implement transaction to send the totalSol to the winner.
  gameState.leader = null;
  gameState.endTime = Date.now() + 3600000; // Reset timer to 1 hour.
  gameState.lastSol = 100_00_000;
  gameState.totalBurned = 0;

  await generateLeaderboardImage(gameState);
};

app.openapi(
  createRoute({
    method: 'post',
    path: '/play',
    tags: ['FOMO3D'],
    request: {
      body: actionSpecOpenApiPostRequestBody,
    },
    responses: actionsSpecOpenApiPostResponse,
  }),
  async (c) => {
    if (gameState.leader == null){
      let sigs = await connection.getSignaturesForAddress(providerKeypair.publicKey, {limit: 1000})
      const lastTx = await connection.getTransaction(sigs[sigs.length-1].signature)
      gameState.leader = lastTx?.transaction.message.accountKeys[0] as PublicKey
    }
    const { account } = (await c.req.json()) as { account: string; solAmount: number };
const solAmount = (gameState.lastSol / 10 ** 9 + 1) * 10 ** 9;
    if (new BN(solAmount).toNumber() <= gameState.lastSol) {
      return c.json({
        message: `You need to send at least ${gameState.lastSol / 10 ** 9} SOL to play.`,
      } satisfies ActionsSpecErrorResponse, { status: 400 });
    }
    const userPublicKey = new PublicKey(account);
   
    // Swap SOL to the game token using Jupiter API
    const quoteRequest: QuoteGetRequest = {
      inputMint: 'So11111111111111111111111111111111111111112', // SOL mint address
      outputMint: burnTokenAddress, // Game token address
      amount: new BN(solAmount).toNumber(), // Convert SOL amount to lamports
      autoSlippage: true,
      maxAutoSlippageBps: 500,
    };

    const quote = await jupiterApi.quoteGet(quoteRequest);
    const swapRequest: SwapPostRequest = {
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: account,
        prioritizationFeeLamports: 'auto',
      }
    };

    const instructions = await jupiterApi.swapInstructionsPost({ swapRequest: swapRequest.swapRequest });

    const {
      tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
      computeBudgetInstructions, // The necessary instructions to setup the compute budget.
      setupInstructions, // Setup missing ATA for the users.
      swapInstruction: swapInstructionPayload, // The actual swap instruction.
      cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
      addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
    } = instructions;
    
    const deserializeInstruction = (instruction: any) => {
      return new TransactionInstruction({
        programId: new PublicKey(instruction.programId),
        keys: instruction.accounts.map((key: any) => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        data: Buffer.from(instruction.data, "base64"),
      });
    };
    
    const getAddressLookupTableAccounts = async (
      keys: string[]
    ): Promise<AddressLookupTableAccount[]> => {
      const addressLookupTableAccountInfos =
        await connection.getMultipleAccountsInfo(
          keys.map((key) => new PublicKey(key))
        );
    
      return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
        const addressLookupTableAddress = keys[index];
        if (accountInfo) {
          const addressLookupTableAccount = new AddressLookupTableAccount({
            key: new PublicKey(addressLookupTableAddress),
            state: AddressLookupTableAccount.deserialize(accountInfo.data),
          });
          acc.push(addressLookupTableAccount);
        }
    
        return acc;
      }, new Array<AddressLookupTableAccount>());
    };
    
    const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    
    addressLookupTableAccounts.push(
      ...(await getAddressLookupTableAccounts(addressLookupTableAddresses))
    );
    
    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(account),
      recentBlockhash: blockhash,
      instructions: [
       ...setupInstructions.map(deserializeInstruction),
        deserializeInstruction(swapInstructionPayload),
        deserializeInstruction(cleanupInstruction),
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account),
          toPubkey: providerKeypair.publicKey,
          lamports: new BN(solAmount ).toNumber()
        }),
        createBurnInstruction(
          getAssociatedTokenAddressSync(
            new PublicKey(burnTokenAddress),
            new PublicKey(account)
          ),
          new PublicKey(burnTokenAddress),
          new PublicKey(account),
          new BN(quote.outAmount)
        )
      ],
    }).compileToV0Message(addressLookupTableAccounts);
    const transaction = new VersionedTransaction(messageV0);
    // Burn the swapped tokens
    // Implement your token burning logic here

    gameState.totalBurned = gameState.totalBurned + (Number(quote.outAmount) / (10 ** 6));

    // Update the leader and reset the timer
    gameState.leader = userPublicKey;
    gameState.lastSol = solAmount;
    if (gameState.endTime < Date.now()) {
    const winnerPublicKey = new PublicKey(gameState.leader);
    const providerBalance = await connection.getBalance(providerKeypair.publicKey) - 100000;
    
    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: providerKeypair.publicKey,
        toPubkey: winnerPublicKey,
        lamports: providerBalance,
      })

    ).add(ComputeBudgetProgram.setComputeUnitPrice({microLamports: 333333}));
    transferTransaction.feePayer = providerKeypair.publicKey
    transferTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    transferTransaction.sign(providerKeypair);
    await connection.sendRawTransaction(transferTransaction.serialize());


    await connection.sendTransaction(transferTransaction, [providerKeypair]);
    }
    gameState.endTime = Date.now() + 3600000; // Reset timer to 1 hour.

    await generateLeaderboardImage(gameState);
    const response: ActionsSpecPostResponse = {
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
    const response: ActionsSpecGetResponse = {
      icon: 'data:image/png;base64,' +  await generateLeaderboardImage(gameState),
      label: `FOMO3D Status`,
      title: `FOMO3D Status`,
      description: `Total SOL: ${await connection.getBalance(providerKeypair.publicKey) / 10 ** 9} SOL, Total Burned: ${gameState.totalBurned}, Leader: ${gameState.leader?.toString() || 'None'}, Time Left: ${(gameState.endTime - Date.now()) / 1000} seconds. Write this as a logical sentence, smash the button below and if nobody else plays in an hour you'll win the pot of ${(await connection.getBalance(providerKeypair.publicKey)) / 10 ** 9} SOL!!!`,
      links: {
        actions: [{
            label: `Play for ${(gameState.lastSol*2) / 10 ** 9} SOL`,
            href: `/play`,
          }
        ]
      },
    };
    return c.json(response);
  },
);

setInterval(async () => {
  if (Date.now() >= gameState.endTime) {
    await resetGame(gameState.leader!); // Reset the game when the timer runs out.
  }
}, 1000);

export default app;