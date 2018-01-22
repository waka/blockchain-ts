import * as request from "request-promise-native";
import { URL } from "url";
import { Block } from "./blockchain/block";
import { blockHash, hash } from "./blockchain/helper";
import { Transaction } from "./blockchain/transaction";

export class Blockchain {
    private currentTransactions: Transaction[];
    private chain: Block[];
    private nodes: string[];

    constructor() {
        this.currentTransactions = [];
        this.chain = [];
        this.nodes = [];

        // create genesis block
        this.createBlock(100, "1");
    }

    public getChain(): Block[] {
        return this.chain;
    }

    public getNodes(): string[] {
        return this.nodes;
    }

    /**
     * 新しいブロックを作り、チェーンに追加する.
     */
    public createBlock(proof: number, previousHash: string): Block {
        if (!previousHash) {
            previousHash = this.getLastBlock().getPreviousHash();
        }
        const block = new Block(this.chain.length + 1, this.currentTransactions, proof, previousHash);
        this.chain.push(block);

        // reset current transactions
        this.currentTransactions = [];

        return block;
    }

    /**
     * 新しいトランザクションを作り、そのトランザクションを含むブロックのアドレスを返す.
     */
    public createTransaction(sender: string, recipient: string, amount: number): number {
        const txn = new Transaction(sender, recipient, amount);
        this.currentTransactions.push(txn);

        return this.getLastBlock().getIndex() + 1;
    }

    public getLastBlock(): Block {
        if (this.chain.length < 1) {
            throw new Error("The chain should have at least one block.");
        }
        return this.chain[this.chain.length - 1];
    }

    /**
     * ハッシュ関数の最初の4文字が0となるproofを探す.
     */
    public proofOfWork(lastProof: number): number {
        let proof = 0;
        while (!this.validProof(lastProof, proof)) {
            proof += 1;
        }
        return proof;
    }

    /**
     * ノードリストに新規ノードを加える
     */
    public registerNode(address: string): void {
        const parsedURL = new URL(address);
        this.nodes.push(parsedURL.host);

        // be uniq
        this.nodes = this.nodes.filter((x, i, self) => self.indexOf(x) === i);
    }

    /**
     * ブロックチェーンが正しいかをチェック.
     */
    public validChain(chain: Block[]): boolean {
        let lastBlock = chain[0];
        let currentIndex = 1;
        let result = true;

        while (currentIndex < chain.length) {
            const block = chain[currentIndex];
            if (block.getPreviousHash() !== blockHash(lastBlock)) {
                result = false;
                break;
            }
            if (!this.validProof(lastBlock.getProof(), block.getProof())) {
                result = false;
                break;
            }

            lastBlock = block;
            currentIndex += 1;
        }

        return result;
    }

    public async resolveConflicts(): Promise<boolean> {
        let newChain = null;
        let maxLength = this.chain.length;

        for (const node of this.nodes) {
            const responseJSON = await request({ url: `http://${node}/chain`, json: true });
            const chain = responseJSON.chain;
            if (chain.length > maxLength && this.validChain(chain)) {
                newChain  = chain;
                maxLength = chain.length;
            }
        }
        if (newChain !== null) {
            this.chain = newChain;
            return true;
        } else {
            return false;
        }
    }

    private validProof(lastProof: number, proof: number): boolean {
        const guess: string = `${ lastProof }${ proof }`;
        return hash(guess).indexOf("0000") === 0;
    }
}
