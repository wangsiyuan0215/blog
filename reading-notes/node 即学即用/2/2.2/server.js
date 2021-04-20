const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.listen(8000);

const tweets = [];

app.get("/", function (req, res) {
  res.send("welcome to Node Twitter");
});

//! bodyParser 中间件，将 post 传递的请求体中的数据转换成对象
app.post("/send", bodyParser(), function (req, res) {
  if (req.body && req.body.tweet) {
    tweets.push(req.body.tweet);
    res.send({ status: "ok", message: "Tweet received" });
  } else {
    res.send({ status: "nok", message: "No tweet received" });
  }
});

app.get("/tweets", function (req, res) {
  res.send(tweets);
});
