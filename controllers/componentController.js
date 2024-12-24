const db = require('../db');

// Helper function to fetch data by id from the database
async function fetchComponentData(componentId) {
    const componentQuery = 'SELECT * FROM components WHERE id = ?';
    const [components] = await db.query(componentQuery, [componentId]);
      if (components.length === 0) return null;
    const component = components[0];
    // Fetch related data: pictures, params, snippets in parallel
    const picsQuery = 'SELECT * FROM component_pics WHERE component_id = ?';
    const paramsQuery = 'SELECT * FROM component_params WHERE component_id = ?';
    const snippetsQuery = 'SELECT * FROM component_snippets WHERE component_id = ?';
    const [[pics], [params], [snippets]] = await Promise.all([
        db.query(picsQuery, [componentId]),
        db.query(paramsQuery, [componentId]),
        db.query(snippetsQuery, [componentId])
    ]);
    return {
        component,
        pics: pics || [],
        params: params || [],
        snippets: snippets || [],
    };
}

function createTabs(snippets) {
    return (snippets || []).map((snippet, index) => ({
        id: index + 1,
        name: snippet.file_name,
        active: index === 0,
        type: 'code_snippets'
    }));
}

// Base render method
function renderPage(res, page, componentData, tabs = []) {
    res.render(page, {
        tag: "", //we are not searching by tag anymore so set this to empty
        component: componentData?.component || null,
        pics: componentData?.pics || [],
        params: componentData?.params || [],
        snippets: componentData?.snippets || [],
        tabs: tabs
    });
}

exports.getComponentDetails = async (req, res) => {
    const componentId = req.query.componentId; // Get the component ID from the user input (query)
    try {
        const componentData = componentId ? await fetchComponentData(componentId) : null
        const tabs = componentData?.snippets ? createTabs(componentData.snippets) : [];
        renderPage(res, "index", componentData, tabs);
    } catch (err) {
        console.error('Error fetching component details data:', err.message);
        res.status(500).send('Server error');
    }
};

exports.getUpdateComponent = async (req, res) => {
    const componentId = req.query.componentId; // Get the component ID from the user input (query)

    try {
        const componentData = componentId ? await fetchComponentData(componentId) : null
         const tabs = componentData?.snippets ? createTabs(componentData.snippets) : [];
        renderPage(res, "update", componentData, tabs);
    } catch (err) {
        console.error('Error fetching component update data:', err.message);
        res.status(500).send('Server error');
    }
};
exports.getAllComponents = async (req, res) => {
    try {
        let userInput = req.query.tag || ""; // Get the tag substring from user input

        // Sanitize userInput for LIKE clause
        userInput = userInput.replace(/[%_]/g, '\\$&');
        const queryValue = `%${userInput}%`;

        const componentQuery = 'SELECT * FROM components WHERE tags LIKE ?';
        const [components] = await db.query(componentQuery, [queryValue]);

        if (components.length > 0) {
            const componentsWithData = await Promise.all(components.map(async (component) => {
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


                return {
                    component,
                    pics: pics || [],
                    params: params || [],
                    snippets: snippets || [],
                    tabs
                };
            }));

            res.render('search_by_tag', {
                tag: userInput,
                components: componentsWithData
            });
        } else {
            // Render the page with empty values if no component is found
            res.render('search_by_tag', {
                tag: userInput,
                components: []
            });
        }
    } catch (err) {
        console.error('Error fetching component data:', err.message); // Log error message only
        res.status(500).send('Server error');
    }
};


exports.getNewFormComponent = async (req, res, next) => {
    try {
        res.render('new', {});
    } catch (err) {
        console.error('Error in getNewFormComponent:', err);
        next(err);
    }
}



exports.postUpdateComponent = async (req, res) => {
    try {
        const formData = req.body;
        const files = req.files;
        let componentId = formData.componentId; // Retrieve componentId
         const existingPics = formData.existing_pics || [];
       // Collect uploaded file paths
         const uploadedFiles = [];

        if(files && files.length > 0){
                files.forEach(file => {
                   uploadedFiles.push(`public/images/${file.filename}`);
             });
         }

      // Sanitize component data
      const componentData = {
          name: formData.name,
          tags: formData.tags,
          programming_language: formData.programming_language,
      };


      if (componentId) {
           // Update existing component
          await db.query('UPDATE components SET ? WHERE id = ?', [componentData, componentId]);

         // Remove previous pics
          await db.query('DELETE FROM component_pics WHERE component_id = ?', [componentId]);
           // Remove previous params
         await db.query('DELETE FROM component_params WHERE component_id = ?', [componentId]);
          // Remove previous snippets
         await db.query('DELETE FROM component_snippets WHERE component_id = ?', [componentId]);
          console.log(`Component with id ${componentId} updated successfully.`);

      } else {
          // Insert new component
            const [componentResult] = await db.query('INSERT INTO components SET ?', componentData);
          componentId = componentResult.insertId;
          console.log(`Component with id ${componentId} created successfully.`);
      }
      // Insert component pictures
       const allPics = [...uploadedFiles, ...Object.values(existingPics)];

         if (allPics && allPics.length > 0) {
             const picValues = allPics.map(picPath => [componentId, picPath]);
              await db.query('INSERT INTO component_pics (component_id, pic_path) VALUES ?', [picValues]);
         }else{
             console.log('No pics attached');
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
};
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
                if (picErr) {
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
