const dotenv = require("dotenv");

dotenv.config({path:"../.env"});

const username = process.env.DB_USERNAME;
const pwd = process.env.DB_PASSWORD;
const dbname = process.env.DB_NAME;

const mongodbURI = `mongodb+srv://${username}:${pwd}@codefarm.tocrgs2.mongodb.net/?retryWrites=true&w=majority`;
module.exports = mongodbURI;
