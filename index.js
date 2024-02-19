const express = require("express");
const app = express();

app.listen(3000);

require("dotenv").config();

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

console.log(API_URL + "/villagers");

fetch(API_URL + "/villagers", {
  method: "GET",
  headers: { "X-API-KEY": API_KEY, "Accept-Version": "1.6.0" },
})
  .then((response) => response.json())
  .then((data) => console.log(data));
