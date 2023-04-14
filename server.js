const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 9000 });

wss.on("connection", function (ws) {
    const group = [];

    ws.on("message", function (message) {
        const data = JSON.parse(message.toString());

        if (data.event === "login") {
            ws.enterInfo = data;
        }

        if (typeof ws.roomId === "undefined" && data.roomId) {
            ws.roomId = data.roomId;
            if (typeof group[ws.roomId] === "undefined") {
                group[ws.roomId] = 1;
            } else {
                group[ws.roomId]++;
            }
        }

        data.num = group[ws.roomId];

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.roomId === ws.roomId) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on("close", function (message) {
        group[ws.roomId]--;

        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN && client.roomId === ws.roomId) {
                client.send(
                    JSON.stringify({
                        ...ws.enterInfo,
                        event: "logout",
                        num: group[ws.roomId],
                    })
                );
            }
        });
    });
});
