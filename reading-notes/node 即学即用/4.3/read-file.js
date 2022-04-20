const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "../readme.md");

const stream = fs.createReadStream(filePath, { highWaterMark: 4 });

buf = Buffer.from([]);

stream.on("data", function (buffer) {
  buf = Buffer.concat([buf, buffer]);
});

stream.on("end", function () {
  console.log(buf.toString("utf8"));
});
