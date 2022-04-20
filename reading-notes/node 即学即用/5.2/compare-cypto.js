const crypto = require("crypto");

const item = { id: 1, name: "wsy", email: "siyuan0215@gmail.com" };

const obj = {
  a: 1,
  b: 2,
  c: {
    d: "d",
    e: 3,
    f: 4,
    g: {
      h: "h",
      i: [item, item, item, item, item, item],
      j: "j",
      k: "k",
      l: {
        m: "m",
        n: [
          item,
          item,
          item,
          item,
          item,
          item,
          item,
          item,
          item,
          item,
          item,
          item,
          item,
          item,
        ],
      },
    },
  },
};

const str = JSON.stringify(obj);

let start_T = Date.now();

const md5_before = crypto.createHash("md5");

md5_before.update(str);
const md5_before_str = md5_before.digest("hex");

const str_after = JSON.stringify(((obj.c.g.l.m = "mm"), str));
const md5_after = crypto.createHash("md5");

md5_after.update(str_after);
const md5_after_str = md5_after.digest("hex");

const r_1 = md5_before_str === md5_after_str;

let end_T = Date.now();

console.log(r_1, end_T - start_T);

start_T = Date.now();

const r_2 = str === str_after;

end_T = Date.now();

console.log(r_2, end_T - start_T);
