import { Transaction } from "./transaction";

export class Block {
    private static createTimestamp(): number {
        return Math.round((new Date()).getTime() / 1000);
    }

    private index: number;
    private transactions: Transaction[];
    private proof: number;
    private previousHash: string;
    private timestamp: number;

    constructor(index: number, transactions: Transaction[], proof: number, previousHash: string) {
        this.index = index;
        this.transactions = transactions;
        this.proof = proof;
        this.previousHash = previousHash;
        this.timestamp = Block.createTimestamp();
    }

    public getIndex(): number {
        return this.index;
    }

    public getTimestamp(): number {
        return this.timestamp;
    }

    public getTransactions(): Transaction[] {
        return this.transactions;
    }

    public getProof(): number {
        return this.proof;
    }

    public getPreviousHash(): string {
        return this.previousHash;
    }
}
