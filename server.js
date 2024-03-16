const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve your HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registering the endpoint for communication with the client
app.post('/api/register_highscore', async (req, res) => {
    try {
        const fileContent = await fs.readFile("highscores.json");
        const existingData = JSON.parse(fileContent);

        // Check if the existing data is an array, if not, initialize an empty array
        const highscores = Array.isArray(existingData) ? existingData : [];

        // Add the new high score
        const newHighScore = { rank: highscores.length + 1, initials: req.body.initials, score: req.body.score };
        highscores.push(newHighScore);

        // Sort the high scores by score in descending order
        highscores.sort((a, b) => b.score - a.score);

        // Assign ranks based on the sorted order
        highscores.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        // Write the updated high scores back to the file
        await fs.writeFile("highscores.json", JSON.stringify(highscores));

        // Send the updated high scores as the response
        res.send({ highscores });
    } catch (error) {
        console.error("Error processing high scores:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Serve high scores
app.get('/api/highscores', async (req, res) => {
    try {
        const highscores = JSON.parse(await fs.readFile("highscores.json"));

        // Sort high scores by score in ascending order (lowest steps first)
        highscores.sort((a, b) => a.score - b.score);
        res.json(highscores);

    } catch (error) {
        console.error("Error reading high scores:", error);
        res.status(500).send("Internal Server Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});