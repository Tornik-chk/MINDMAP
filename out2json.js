async function returnJSON(input, depth) {
  const learningResources = `Do what i tell you exactly,i want to build tech ${input}.provide me ${depth} topics and make them as short as possible that i need to learn with appropriate resources in an EXACT format dont add anything else (not even code).Format from the easiest to the hardest:
    Topic,resource(only the link) one topic is one new line.dont add anything else other than what i told you ONLY TOPIC THEN COMMA THEN RESOURCE`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "user",
              content: learningResources,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const outStr = data.choices[0].message.content;
    const parsedData = parseInputAndSaveJSON(outStr); // This will return the parsed data

    return parsedData; // Return the result of parsing
  } catch (error) {
    console.error("Error:", error);
  }
}

function parseInputAndSaveJSON(inputString) {
  const lines = inputString.trim().split("\n");
  const result = lines
    .map((line) => {
      const lastCommaIndex = line.lastIndexOf(","); // Find the last comma
      if (lastCommaIndex === -1) return null;

      const name = line.substring(0, lastCommaIndex).trim(); // Take everything before the last comma
      const resource = line.substring(lastCommaIndex + 1).trim(); // Take the URL after the last comma

      return { name, resource };
    })
    .filter((item) => item !== null);

  const jsonString = JSON.stringify(result, null, 4); // Format JSON output
  console.log("JSON file has been saved as output.json");

  return result;
}

// Call the function and log the result
returnJSON("recipe maker app", 10).then((result) => console.log(result));
