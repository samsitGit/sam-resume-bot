const express = require('express');
const cors = require('cors'); // Import the cors package
const axios = require('axios'); // Import the axios package
const fs = require('fs'); // Import the fs package
const apiKey = process.env.OPENAI_API_KEY;

const app = express();
const port = 3000;

app.use(cors()); // Use the cors middleware
app.use(express.json());


// Read the contents of the resumeSmall.txt file
const context = "I'm a helpful assistant made to answer any questions about Sam's resume.";
const resumeContent = fs.readFileSync('resumeSmall.txt', 'utf-8');

// Define a route that handles chatbot responses
app.post('/getChatbotResponse', async (req, res) => {
    const userInput = req.body.userInput;

    // Use Axios to proxy the request to the OpenAI API
    try {
        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that answer questions about Sam\'s resume.' },
                    { role: 'user', content: context + '\n' + resumeContent }, // User message
                    { role: 'assistant', content: 'User: ' + userInput } // Assistant message
                ],
                max_tokens: 300,
                model: 'gpt-3.5-turbo'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiKey
                }
            }
        );

        const chatbotResponse = openaiResponse.data.choices[0].message.content;

        // Return the chatbot response to the front end
        res.json({ message: chatbotResponse });
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        res.status(500).json({ error: 'Error fetching chatbot response' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
