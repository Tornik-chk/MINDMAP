require("dotenv").config(); //hardpath is not specified, API key is taken from .nev file which is in pur project root
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_KEY = process.env.OPENROUTER_API_KEY; // we set up the API key from .nev file

// Fetch roadmap based on input and depth
async function returnJSON(input, depth) {
  const learningResources = `Do what I tell you exactly. I want to build tech ${input}. Provide me ${depth} topics and make them as short as possible that I need to learn with appropriate resources in an EXACT format. Don't add anything else (not even code). Format from the easiest to the hardest:
      Topic,resource(only the link) one topic is one new line. don't add anything else other than what I told you, ONLY TOPIC THEN COMMA THEN RESOURCE,  DO NOT NUMBER IT.`;

  try {
    const response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`, // Ensure the  API key is used correctly
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [{ role: "user", content: learningResources }],
        }),
      },
      60000 // we set timer for 30seconds, so it wont run indefinitly
    );

    //console logs I used for debugging
    console.log(response.status);
    const rawText = await response.text();
    console.log(rawText);

    // Parse the raw response
    const data = JSON.parse(rawText);

    // now we validate our API response
    if (!data.choices || !data.choices.length || !data.choices[0].message) {
      throw new Error("Invalid API response format");
    }

    return parseInputAndSaveJSON(data.choices[0].message.content);
  } catch (error) {
    console.error("Error in returnJSON:", error);
    return { error: "Failed to fetch data from OpenRouter API" };
  }
}

// Converts API string response into JSON format.

function parseInputAndSaveJSON(inputString) {
  if (!inputString || typeof inputString !== "string") {
    return { error: "Invalid input data format" };
  }

  const lines = inputString.trim().split("\n");
  return lines
    .map((line) => {
      const lastCommaIndex = line.lastIndexOf(",");
      if (lastCommaIndex === -1) return null;

      return {
        topic: line.substring(0, lastCommaIndex).trim(),
        resource: line.substring(lastCommaIndex + 1).trim(),
      };
    })
    .filter((item) => item !== null);
}

// Custom wrapper for fetch with a timeout.

function fetchWithTimeout(url, options, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Request timed out")),
      timeout
    );

    fetch(url, options)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer)); // We clear timeout once the request finishes
  });
}

app.get("/api/roadmap", async (req, res) => {
  try {
    const { input, depth } = req.query; // Now we just take query parameters

    if (!input || !depth) {
      return res
        .status(400)
        .json({ error: "Missing input or depth parameter" });
    }

    const depthNum = parseInt(depth, 10);
    if (isNaN(depthNum) || depthNum <= 0) {
      return res.status(400).json({ error: "Depth must be a positive number" });
    }

    const result = await returnJSON(input, depthNum);

    // Add a console log here to confirm the result
    console.log("Returned API Data:", result);

    res.json(result); // Return JSON response
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
