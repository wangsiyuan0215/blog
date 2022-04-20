const http = require("http");
const assert = require("assert");

const options = {
  host: "localhost",
  port: 8000,
  path: "/send",
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

const req = http.request(options, function (res) {
  res.setEncoding("utf8");

  let buf = Buffer.from("");

  res.on("data", function (buffer) {
    buf = Buffer.concat([buf, Buffer.from(buffer)]);
  });

  res.on("error", function (e) {
    console.log(e);
  });

  res.on("end", function () {
    assert.strictEqual(
      buf.toString(),
      '{"status":"ok","message":"Tweet received"}'
    );
  });
});

req.write("tweet=test");
req.end();
