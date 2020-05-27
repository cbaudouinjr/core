import { InvalidMultiSignatureAssetError, PublicKeyError } from "../errors";
import { IMultiSignatureAsset } from "../interfaces";
import { LibraryManager } from "../managers/library-manager";
import { Keys } from "./keys";

export class PublicKey<T> {
    private secp256k1: any;
    private numberToHex: any;

    public constructor(libraryManager: LibraryManager<T>, private keys: Keys<T>) {
        this.secp256k1 = libraryManager.Libraries.secp256k1;
        this.numberToHex = libraryManager.Crypto.numberToHex;
    }

    public fromPassphrase(passphrase: string): string {
        return this.keys.fromPassphrase(passphrase).publicKey;
    }

    public fromWIF(wif: string): string {
        return this.keys.fromWIF(wif).publicKey;
    }

    public fromMultiSignatureAsset(asset: IMultiSignatureAsset): string {
        const { min, publicKeys }: IMultiSignatureAsset = asset;

        for (const publicKey of publicKeys) {
            if (!/^[0-9A-Fa-f]{66}$/.test(publicKey)) {
                throw new PublicKeyError(publicKey);
            }
        }

        if (min < 1 || min > publicKeys.length) {
            throw new InvalidMultiSignatureAssetError();
        }

        const minKey: string = this.fromPassphrase(this.numberToHex(min));
        const keys: string[] = [minKey, ...publicKeys];

        return this.secp256k1
            .publicKeyCombine(keys.map((publicKey: string) => Buffer.from(publicKey, "hex")))
            .toString("hex");
    }
}
