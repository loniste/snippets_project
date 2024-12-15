const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));


// Endpoint to fetch values from JSON files
app.get('/get-values', (req, res) => {
    const mainFolder = path.join(__dirname, 'images');
    const targetKey = req.query.key.toLowerCase(); // Convert user input to lowercase
    let results = [];

    function readFolder(folderPath) {
        const filesAndFolders = fs.readdirSync(folderPath);

        filesAndFolders.forEach((item) => {
            const itemPath = path.join(folderPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                readFolder(itemPath);
            } else if (stats.isFile() && path.extname(item) === '.json') {
                try {
                    const jsonData = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
                    const fileName = path.basename(item); // Get the short file name
                    collectValues(jsonData, targetKey, fileName, results);
                } catch (error) {
                    console.error(`Error parsing JSON in file: ${itemPath}`, error);
                }
            }
        });
    }

    function collectValues(obj, targetKey, fileName, resultArray) {
        if (typeof obj === 'object' && obj !== null) {
            let resultEntry = { tags: null, file_name: fileName, pics: [] };
            for (const [k, v] of Object.entries(obj)) {
                if (k === 'tags' && typeof v === 'string' && v.toLowerCase().includes(targetKey)) {
                    resultEntry.tags = v;
                }
                if (k === 'pics' && Array.isArray(v)) {
                    resultEntry.pics = v;
                }
                if (typeof v === 'object') {
                    collectValues(v, targetKey, fileName, resultArray);
                }
            }
            if (resultEntry.tags) {
                resultArray.push(resultEntry);
            }
        }
    }

    readFolder(mainFolder);
    res.json({ values: results });
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
