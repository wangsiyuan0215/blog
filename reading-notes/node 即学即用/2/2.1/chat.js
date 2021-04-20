const net = require("net");

const chatServer = net.createServer();
let clients = [];

chatServer.on("connection", function (client) {
  client.name = `${client.remoteAddress}:${client.remotePort}`;
  client.write("Hi\n");
  //   client.write("By\n");
  //   client.end();
  clients.push(client);
  client.on("data", function (buffer) {
    broadcast(buffer, client);
  });
  client.on("end", function () {
    clients = clients.filter((item) => item.port !== client.port);
  });
  client.on("error", function (e) {
    console.log(e);
  });
});

const broadcast = (message, client) => {
  let cleanup = [];
  for (const item of clients) {
    if (client.name !== item.name) {
      if (item.writable) {
        item.write(`${client.name} says ${message}`);
      } else {
        cleanup.push(item);
        item.destroy();
      }
    }
  }

  const ports = cleanup.map((item) => item.name);
  clients = clients.filter((item) => !ports.includes(item.name));
};

chatServer.listen(9000, "127.0.0.1");
