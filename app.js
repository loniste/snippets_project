const express = require('express');
const app = express();
const port = 3000;
const db = require('./db');
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
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
app.get('/new', (req, res) => {
  res.render('new', {});
});
app.post('/submit-component', (req, res) => {
  const formData = req.body;
  // Insert into components table
  const componentData = {
      name: formData.name,
      tags: formData.tags.join(', '),
      programming_language: formData.programming_langage,
  };

  db.query('INSERT INTO components SET ?', componentData, (err, componentResult) => {
      if (err) {
          console.error('Error inserting into components table:', err);
          return res.status(500).send('Error saving component data.');
      }
      const componentId = componentResult.insertId;


       // Insert into component_pics table
          if (formData.pics && formData.pics.length > 0) {
            const picValues = formData.pics.map(picPath => [componentId, picPath]);
            db.query('INSERT INTO component_pics (component_id, pic_path) VALUES ?', [picValues], (picErr) => {
                if(picErr){
                    console.error('Error inserting into component_pics table:', picErr);
                    return res.status(500).send('Error saving component pics.');
                }
                 console.log("pics inserted");
            });
        }
    // Insert into component_params table
      if(formData.params && formData.params.length > 0){
           const paramValues = formData.params.map(param => [componentId, param.param, param.desc, param.required]);
          db.query('INSERT INTO component_params (component_id, param, description, required) VALUES ?', [paramValues], (paramErr) => {
              if (paramErr) {
                  console.error('Error inserting into component_params table:', paramErr);
                  return res.status(500).send('Error saving component params.');
              }
              console.log("params inserted");
          });
        }
    // Insert into component_snippets table
    if (formData.snippets && formData.snippets.length > 0) {
          const snippetValues = formData.snippets.map(snippet => [componentId, snippet.file_name, snippet.snippet]);
          db.query('INSERT INTO component_snippets (component_id, file_name, snippet) VALUES ?', [snippetValues], (snippetErr) => {
            if (snippetErr) {
                console.error('Error inserting into component_snippets table:', snippetErr);
                return res.status(500).send('Error saving component snippets.');
            }
              console.log("snippets inserted");
          });
      }
     res.status(200).send('Component data saved successfully.');
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
