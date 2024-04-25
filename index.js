const express = require("express");
const app = express();
const fs = require("fs");

require("dotenv").config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;
const OUTPUT_FILE = "api_response.json";

const furniture = require("./furniture_minified.json");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Content-Type", "application/json");
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
  if (path === "furniture") return furniture;

  const resource = path === "villagers" ? "villagers" : `nh/${path}`;
  console.log("Fetching resource:", API_URL + resource);

  try {
    const response = await fetch(API_URL + resource, {
      method: "GET",
      headers: { "X-API-KEY": API_KEY, "Accept-Version": "1.6.0" },
    });

    const data = await response.json();

    // If running in dev mode, output API response to OUTPUT_FILE
    if (NODE_ENV === "dev") {
      let minify = false;
      if (path === "furniture") {
        minify = true;
        trimFurniture(data);
      }
      console.log(`Writing to ${OUTPUT_FILE}...`);
      fs.writeFile(
        OUTPUT_FILE,
        JSON.stringify(data, null, minify ? 0 : 4),
        (error) => {
          if (error) console.error(`Error writing to ${OUTPUT_FILE}:`, error);
          else console.log(`Successfully wrote to ${OUTPUT_FILE}`);
        }
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching resource:", error);
    return null;
  }
}

// Helper function for trimming furniture object that is returned by API.
// Only used in development.
const trimFurniture = (data) => {
  data.forEach((furniture) => {
    delete furniture.url;
    delete furniture.functions;
    delete furniture.hha_base;
    delete furniture.hha_category;
    delete furniture.lucky;
    delete furniture.lucky_season;
    delete furniture.item_set;
    delete furniture.item_series;
    delete furniture.custom_kits;
    delete furniture.custom_kit_type;
    delete furniture.custom_body_part;
    delete furniture.custom_pattern_part;
    delete furniture.height;
    delete furniture.door_decor;
    delete furniture.version_added;
    delete furniture.unlocked;
    delete furniture.notes;
    delete furniture.variation_total;
    delete furniture.pattern_total;
    delete furniture.grid_width;
    delete furniture.grid_length;

    furniture.variations.forEach((variation) => {
      delete variation.variation;
      delete variation.pattern;
      delete variation.colors;
    });
  });
};
