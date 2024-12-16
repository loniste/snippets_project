const db = require('../db');

exports.getComponentInfo = async (req, res) => {
    try {
      let userInput = req.query.tag || ""; // Get the tag substring from user input
  
      // Sanitize userInput for LIKE clause
      userInput = userInput.replace(/[%_]/g, '\\$&'); 
      const queryValue = `%${userInput}%`;
  
      const componentQuery = 'SELECT * FROM components WHERE tags LIKE ?';
      const [components] = await db.query(componentQuery, [queryValue]);
  
      if (components.length > 0) {
        const component = components[0];
        const componentId = component.id;
  
        // Fetch related data: pictures, params, snippets in parallel
        const picsQuery = 'SELECT * FROM component_pics WHERE component_id = ?';
        const paramsQuery = 'SELECT * FROM component_params WHERE component_id = ?';
        const snippetsQuery = 'SELECT * FROM component_snippets WHERE component_id = ?';
  
        const [[pics], [params], [snippets]] = await Promise.all([
          db.query(picsQuery, [componentId]),
          db.query(paramsQuery, [componentId]),
          db.query(snippetsQuery, [componentId])
        ]);
  
        const tabs = (snippets || []).map((snippet, index) => ({
          id: index + 1,
          name: snippet.file_name,
          active: index === 0,
          type: 'code_snippets'
        }));
  
        res.render('index', {
          tag: userInput,
          component,
          pics: pics || [],
          params: params || [],
          snippets: snippets || [],
          tabs
        });
      } else {
        // Render the page with empty values if no component is found
        res.render('index', {
          tag: userInput,
          component: "",
          pics: [],
          params: [],
          snippets: [],
          tabs: []
        });
      }
    } catch (err) {
      console.error('Error fetching component data:', err.message); // Log error message only
      res.status(500).send('Server error');
    }
  };
  

exports.getNewFormComponent = async (req,res, next) => {
    try {
        res.render('new', {});
    } catch (err) {
        console.error('Error in getNewFormComponent:', err);
        next(err);
    }
}

exports.submitComponent = async (req, res) => {
    try {
      const formData = req.body;
      const files = req.files;

      // Collect uploaded file paths
      const uploadedFiles = [];
      for (const key in files) {
        if (Array.isArray(files[key])) {
          for (const file of files[key]) {
            uploadedFiles.push(`public/images/${file.filename}`);
          }
        }
      }

      // Insert component data into the database
      const componentData = {
        name: formData.name,
        tags: formData.tags,
        programming_language: formData.programming_language,
      };

      const [componentResult] = await db.query('INSERT INTO components SET ?', componentData);
      const componentId = componentResult.insertId;

      // Insert component pictures
      if (uploadedFiles && uploadedFiles.length > 0) {
        const picValues = uploadedFiles.map(picPath => [componentId, picPath]);
        await db.query('INSERT INTO component_pics (component_id, pic_path) VALUES ?', [picValues], (picErr) => {
            if(picErr){
                console.error('Error inserting into component_pics table:', picErr);
                return res.status(500).send('Error saving component pics.');
            }
        });
        console.log('Pictures inserted successfully.');
    }

      // Parse JSON fields
      let params = [];
      let snippets = [];
      try {
        params = JSON.parse(formData.params || '[]');
        snippets = JSON.parse(formData.snippets || '[]');
      } catch (e) {
        console.error('Error parsing JSON fields:', e);
        return res.status(400).send('Invalid JSON in params or snippets.');
      }

      // Insert component parameters
      if (params.length > 0) {
        const paramValues = params.map((param) => [
          componentId,
          param.param,
          param.desc,
          param.required,
        ]);
        await db.query(
          'INSERT INTO component_params (component_id, param, description, required) VALUES ?',
          [paramValues]
        );
        console.log('Parameters inserted successfully.');
      }

      // Insert component snippets
      if (snippets.length > 0) {
        const snippetValues = snippets.map((snippet) => [
          componentId,
          snippet.file_name,
          snippet.snippet,
        ]);
        await db.query(
          'INSERT INTO component_snippets (component_id, file_name, snippet) VALUES ?',
          [snippetValues]
        );
        console.log('Snippets inserted successfully.');
      }

      // Send success response
      res.status(200).json({ message: 'Component data saved successfully.', formData });
    } catch (err) {
      console.error('Error processing request:', err);
      res.status(500).send('Server error while saving component data.');
    }
  }
