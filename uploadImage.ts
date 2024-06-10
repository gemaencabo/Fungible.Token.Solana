import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { readFile } from "fs/promises";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { updateMetadataAccountV2, UpdateMetadataAccountV2InstructionArgs, UpdateMetadataAccountV2InstructionAccounts, DataV2Args, MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { publicKey as publicKeySerializer, string } from '@metaplex-foundation/umi/serializers';
import wallet from "./wallet.json";

const umi = createUmi("https://api.devnet.solana.com", "finalized");
umi.use(irysUploader());

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));

const mint = publicKey("FPfg9WeTowX8rTfcefEtcmsyG6oWEEdwkN58CymdnQJG");

const seeds = [
    string({ size: "variable" }).serialize("metadata"),
    publicKeySerializer().serialize(MPL_TOKEN_METADATA_PROGRAM_ID),
    publicKeySerializer().serialize(mint),
];
const metadata = umi.eddsa.findPda(MPL_TOKEN_METADATA_PROGRAM_ID, seeds);

const main = async () => {
    try {
        console.log("Leyendo la imagen...");
        const image = await readFile('./image.jpg');
        const nft_image = createGenericFile(image, "society3.0");

        console.log("Subiendo la imagen...");
        const [myUri] = await umi.uploader.upload([nft_image]);
        console.log("Imagen subida a:", myUri);

        
        const response = await fetch(myUri);
        if (!response.ok) {
            throw new Error(`Failed to fetch image URI: ${myUri}`);
        }
        console.log("URI de la imagen verificada:", myUri);

        console.log("Actualizando metadatos del NFT...");
        let accounts: UpdateMetadataAccountV2InstructionAccounts = {
            metadata: metadata,
            updateAuthority: myKeypairSigner, 
        };

        let data: DataV2Args = {
            name: "Society3.0 Token",
            symbol: "SCT",
            uri: myUri,
            sellerFeeBasisPoints: 500,
            creators: [
                {
                    address: keypair.publicKey,
                    verified: true,
                    share: 100,
                }
            ],
            collection: null,
            uses: null,
        };

        let args: UpdateMetadataAccountV2InstructionArgs = {
            data: data,
            newUpdateAuthority: keypair.publicKey, 
            primarySaleHappened: null,
            isMutable: null,
        };

        let tx = updateMetadataAccountV2(
            umi,
            {
                ...accounts,
                ...args,
            }
        );

        console.log("Enviando transacción para actualizar metadatos...");
        let result = await tx.sendAndConfirm(umi);

        console.log(`Metadatos actualizados. Transacción: https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);
    } catch (error) {
        console.error("Error:", error);
    }
};

main();
