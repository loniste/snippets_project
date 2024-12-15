const express = require('express');
const app = express();
const port = 3000;
const db = require('./db');
const path = require('path');

// Set up the view engine (if you want to use dynamic rendering)
app.set('view engine', 'ejs');
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve the main route to show the component info
app.get('/', (req, res) => {
  let userInput = req.query.tag; // Get the tag substring from user input
  if (!userInput) {
    userInput = ""
  }

  const componentQuery = 'SELECT * FROM components WHERE tags LIKE ?';
  const queryValue = `%${userInput}%`; // Prepare the input for the query

  db.query(componentQuery, [queryValue], (err, results) => {
    if (err) {
      console.error('Error fetching component data:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      const component = results[0];
      const componentId = component.id;

      // Fetch related data: pictures, params, snippets
      const picsQuery = 'SELECT * FROM component_pics WHERE component_id = ?';
      const paramsQuery = 'SELECT * FROM component_params WHERE component_id = ?';
      const snippetsQuery = 'SELECT * FROM component_snippets WHERE component_id = ?';

      // Get pictures, params, and snippets in parallel
      db.query(picsQuery, [componentId], (err, pics) => {
        if (err) {
          console.error('Error fetching pictures:', err);
          return res.status(500).send('Server error');
        }

        db.query(paramsQuery, [componentId], (err, params) => {
          if (err) {
            console.error('Error fetching parameters:', err);
            return res.status(500).send('Server error');
          }

          db.query(snippetsQuery, [componentId], (err, snippets) => {
            if (err) {
              console.error('Error fetching snippets:', err);
              return res.status(500).send('Server error');
            }
            const tag = req.query.tag || '';


            // Render the HTML page with data from the database



            const tabs = snippets.map((snippet, index) => ({
              id: index + 1, // Generate id based on the index (start from 1)
              name: snippet.file_name, // Use the file_name as the tab name
              active: index === 0, // Set the first tab as active, others inactive
              type: 'code_snippets'
            }));

            res.render('index', {
              tag,
              component,
              pics,
              params,
              snippets,
              tabs
            });
          });
        });
      });
    } else {
      //res.status(404).send('Component not found');
      res.render('index', {
        tag: userInput,
        component: "",
        pics: "",
        params: "",
        snippets: [],
        tabs:[]
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
