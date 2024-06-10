import {
    Keypair,
    Connection,
    LAMPORTS_PER_SOL,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey
} from "@solana/web3.js";

import wallet from "./wallet.json";


const connection = new Connection("https://api.devnet.solana.com", "finalized");

const from = Keypair.fromSecretKey(new Uint8Array(wallet));

const to = new PublicKey("FEEsfv84AnobvpbFU5etF6ftD3o7w5SJMLX3NQkeinGx");


(async () => {
    try {
        
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: from.publicKey,             
            toPubkey: to,                           
            lamports: 0.5 * LAMPORTS_PER_SOL        
        });

        
        const transaction = new Transaction().add(transferInstruction);

        
        transaction.feePayer = from.publicKey;

        const txHash = await sendAndConfirmTransaction(connection, transaction, [from], { commitment: "finalized", skipPreflight: false });

        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
    } catch (error) {
        console.error(error);
    }
})();