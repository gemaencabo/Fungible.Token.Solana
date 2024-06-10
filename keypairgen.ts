import { Keypair } from "@solana/web3.js";


const keypair = Keypair.generate();


console.log(`Has generado una nueva wallet: ${keypair.publicKey.toBase58()} \n\n Para guardar su wallet, copie y pegue el siguiente JSON en un archivo: [${keypair.secretKey}]`)

