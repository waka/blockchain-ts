import * as http from "http";
import * as querystring from "querystring";

const routes: { [key: string]: any } = { GET: {}, POST: {} };

function get(path: string, callback: (res: http.ServerResponse) => void): void {
    routes.GET[path] = callback;
}

function post(path: string, callback: (res: http.ServerResponse, body: any) => void): void {
    routes.POST[path] = callback;
}

function handler(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (!req.method || !req.url) {
        serverError(res);
        return;
    }

    const callback = routes[req.method][req.url];
    if (!callback) {
        notFound(res);
        return;
    }

    if (req.method === "POST") {
        let body = "";
        req.on("data", (data) => {
            body += data;
        });
        req.on("end", () => {
            let json = null;
            if (req.headers["content-type"] === "application/json") {
                json = JSON.parse(body);
            } else {
                json = querystring.parse(body);
            }
            callback(res, json);
        });
    } else {
        callback(res);
    }
}

function serverError(res: http.ServerResponse): void {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.write("500 Internal Server Error");
    res.end();
}
function notFound(res: http.ServerResponse): void {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("404 Not Found");
    res.end();
}

export { handler, get, post };
