const express = require("express");
const app = express();
const fs = require("fs");

require("dotenv").config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

// const furniture = require("./furniture.json");
// console.log(furniture.length);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const possiblePaths = ["villagers", "furniture", "fish", "bugs", "art"];
app.get("*", async (req, res) => {
  const path = req.path.substring(1);
  const pathIsValid = possiblePaths.includes(path);
  if (!pathIsValid) {
    res.status(404).send("Not found");
    return;
  }
  getResource(path).then((resource) => {
    if (resource === null) res.sendStatus(500);
    else res.status(200).json(resource);
  });
});

app.listen(PORT);
console.log("Listening on port", PORT);

// Get a resource from the API
async function getResource(path) {
  const resource = path === "villagers" ? "villagers" : `nh/${path}`;
  console.log("Fetching resource:", API_URL + resource);

  try {
    const response = await fetch(API_URL + resource, {
      method: "GET",
      headers: { "X-API-KEY": API_KEY, "Accept-Version": "1.6.0" },
    });
    const data = await response.json();
    if (NODE_ENV === "dev") {
      console.log("Writing to api_response.json...");
      fs.writeFile(
        "api_response.json",
        JSON.stringify(data, null, 4),
        (error) => {
          if (error) console.error("Error writing to file:", error);
        }
      );
      return data;
    }
  } catch (error) {
    console.error("Error fetching resource:", error);
    return null;
  }
}
