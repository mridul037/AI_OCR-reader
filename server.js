const express = require('express');
const Together = require('together-ai');
const { tool } = require('ai');
const { z } = require('zod');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Set the destination for uploaded files

const app = express();
const port = 3000;

// API key for Together
const together = new Together({
  apiKey: "<<<<<<>>>>>",  // your api key
});

app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Adjust the path as necessary
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

function encode_image(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}



// Endpoint to fetch todos and add a new one
async function  Run(base64_image){
  // Add todo to the list
  let fullResponse = ""; 
  try{

  // Optionally, you can call Together API to get a response (like some feedback)
 const getDescriptionPrompt="you are give a image you need to extract text from it like a ocr system."
  let mess=[{
    role: "user",
    "content": [
      {"type": "text", "text": getDescriptionPrompt},
      {
          "type": "image_url",
          "image_url": {
              "url": `data:image/jpeg;base64,${base64_image}`
          },
      },
  ],
}];


  const stream = await together.chat.completions.create({
    model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
    messages: mess,
    stream: true,
  });

  let response = "";
  for await (const chunk of stream) {
    fullResponse += chunk.choices[0]?.delta?.content || "";
  }
  return fullResponse
}catch(err){
  console.log(err);
}
}


app.post('/run', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path; // Get the path of the uploaded image
    let base64_image = encode_image(imagePath); // Encode the image to base64

    // Call the Run function with the new image
   const result = await Run(base64_image); // Modify Run to accept base64_image as a parameter
    res.status(200).send(`<div>${result}</div>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the request.");
  }
});
// Serve static HTML files
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
