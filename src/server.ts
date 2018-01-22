import * as http from "http";
import { Blockchain } from "./blockchain";
import { get, handler, post } from "./server/handler";
import { uuid } from "./utils/uuid";

// On memory.
const blockchain = new Blockchain();

// This node uuid
const nodeIdentifier = uuid();

get("/", (res: http.ServerResponse): void => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("Index");
    res.end();
});

type TransactionParams = { sender: string, recipient: string, amount: number };
post("/transactions", (res: http.ServerResponse, body: TransactionParams): void => {
    const index = blockchain.createTransaction(body.sender, body.recipient, body.amount);
    const json = { message: `Add transaction, index: ${index}` };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(json));
    res.end();
});

get("/mine", (res: http.ServerResponse): void => {
    const lastBlock = blockchain.getLastBlock();
    const proof = blockchain.proofOfWork(lastBlock.getProof());

    blockchain.createTransaction("", nodeIdentifier, 1);
    const block = blockchain.createBlock(proof);

    const json = {
        index: block.getIndex(),
        message: "Mined new block.",
        previous_hash: block.getPreviousHash(),
        proof: block.getProof(),
        transactions: block.getTransactions(),
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(json));
    res.end();
});

get("/chain", (res: http.ServerResponse): void => {
    const json = { chain: blockchain.getChain() };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(json));
    res.end();
});

get("/nodes", (res: http.ServerResponse): void => {
    const json = { nodes: blockchain.getNodes() };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(json));
    res.end();
});

type NodesParams = { nodes: string[] };
post("/nodes", (res: http.ServerResponse, body: NodesParams): void => {
    const nodes = body.nodes;
    if (!nodes) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "nodes must be required." }));
        res.end();
        return;
    }

    for (const node of nodes) {
        blockchain.registerNode(node);
    }
    const json = { message: "Add new nodes,", nodes: blockchain.getNodes() };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(json));
    res.end();
});

get("/nodes/resolve", (res: http.ServerResponse): void => {
    blockchain.resolveConflicts().then((result: boolean) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        if (result) {
            const json = { message: "The chain was replaced.", total: blockchain.getChain().length };
            res.write(JSON.stringify(json));
        } else {
            const json = { message: "The chain was confirmed.", total: blockchain.getChain().length };
            res.write(JSON.stringify(json));
        }
        res.end();
    });
});

const server: http.Server = http.createServer();
server.on("request", handler);
server.listen(8000);
