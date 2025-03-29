async function getRoadmap(input, depth) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/roadmap?input=${encodeURIComponent(
        input
      )}&depth=${depth}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); // Parse JSON response
    console.log(data); // Log the result
  } catch (error) {
    console.error("Error fetching roadmap:", error);
  }
}

// Call the function
getRoadmap("recipe maker app", 5);
