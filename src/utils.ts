
import { randomBytes } from 'crypto';
import { bsv } from 'scrypt-ts';

export function dummyUTXO(address: bsv.Address, satoshis: number = 1) {
    return {
        txId: randomBytes(32).toString('hex'),
        outputIndex: 0,
        script: bsv.Script.fromAddress(address).toHex(),   // placeholder
        satoshis
    }
}