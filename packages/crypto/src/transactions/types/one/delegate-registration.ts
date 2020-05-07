import ByteBuffer from "bytebuffer";

import { TransactionType, TransactionTypeGroup } from "../../../enums";
import { ISerializeOptions, ITransactionData } from "../../../interfaces";
import * as schemas from "../schemas";
import { Transaction } from "../transaction";

export abstract class DelegateRegistrationTransaction<T, U extends ITransactionData, E> extends Transaction<T, U, E> {
    public static typeGroup: number = TransactionTypeGroup.Core;
    public static type: number = TransactionType.DelegateRegistration;
    public static key = "delegateRegistration";
    public static version: number = 1;

    protected static defaultStaticFee: string = "2500000000";

    public static getSchema(): schemas.TransactionSchema {
        return schemas.delegateRegistration;
    }

    public serialize(options?: ISerializeOptions): ByteBuffer | undefined {
        const { data } = this;

        if (data.asset && data.asset.delegate) {
            const delegateBytes: Buffer = Buffer.from(data.asset.delegate.username, "utf8");
            const buffer: ByteBuffer = new ByteBuffer(delegateBytes.length, true);

            buffer.writeByte(delegateBytes.length);
            buffer.append(delegateBytes, "hex");

            return buffer;
        }

        return undefined;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const usernamelength: number = buf.readUint8();

        data.asset = {
            delegate: {
                username: buf.readString(usernamelength),
            },
        };
    }
}