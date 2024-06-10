import {
    Keypair,
    Connection,
    PublicKey,
} from "@solana/web3.js";

import {
    getOrCreateAssociatedTokenAccount,
    transfer,
} from "@solana/spl-token";

import wallet from "./wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const mint = new PublicKey("6J64pkuvopNd5p1qSaGDYn9hnFxGdrK6jMZuRF4X56Hi");
const fromAta = new PublicKey("BgXj4dHik7FanM6H5W2KycpzpDdaU6M2xopp6xfQPMeA");

const to = Keypair.generate();
console.log("To: ", to.publicKey.toBase58());

(async () => {

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mint,
        to.publicKey,
    );

    const toAta = tokenAccount.address;
    console.log("Associated Token Account: ", toAta.toBase58());

    const amountToAta = tokenAccount.amount;
    console.log("Amount in ATA: ", amountToAta.toString());

    const amount = 10e5;

    await transfer(
        connection,
        keypair,
        fromAta,
        toAta,
        keypair,
        amount
    );

    console.log("Transferred", amount, "from", fromAta.toBase58(), "to", toAta.toBase58());
})()