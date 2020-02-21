const MongoClient = require("mongodb").MongoClient;
const config = require("config");

module.exports = connectDatabase = async () => {
  const client = new MongoClient(config.get("MongoUri"), {
    useUnifiedTopology: true
  });
  try {
    await client.connect();
    console.log("Database Connected");
    return [client, client.db("ADMIN_TEST")];
  } catch (e) {
    console.log("Error Occurred: ", e.message);
  }
};
