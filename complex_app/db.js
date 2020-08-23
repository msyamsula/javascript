const mongodb = require("mongodb");
const dotenv = require("dotenv");
dotenv.config(); // load env
const uri = process.env.MONGO_URI;

// mongodb.connect(
//   uri,
//   { useNewUrlParser: true, useUnifiedTopology: true },
//   (err, client) => {
//     exports.db = client.db();
//     const app = require("./app");
//     app.listen(5000);
//   }
// );

let conn = async () => {
  let client;
  try {
    client = await mongodb.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    exports.client = client;
    exports.db = client.db();
    const app = require("./app");
    app.listen(5000);
  } catch (err) {
    console.log(err);
  }
};

conn();
