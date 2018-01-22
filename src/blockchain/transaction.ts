export class Transaction {
    private sender: string;
    private recipient: string;
    private amount: number;

    constructor(sender: string, recipient: string, amount: number) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
    }

    public getSender(): string {
        return this.sender;
    }

    public getRecipient(): string {
        return this.recipient;
    }

    public getAmount(): number {
        return this.amount;
    }
}
