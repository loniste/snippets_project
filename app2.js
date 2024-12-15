const express = require('express');
const app = express();
const path = require('path');

// Set up the static directory to serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/details', (req, res) => {
    // Example Data (replace with your actual data source)
    let pics = [
      { id: 1, pic_path: "/images/pic1.png" },
      { id: 2, pic_path: "/images/pic2.png", active: true },
      { id: 3, pic_path: "/images/pic3.png" }
    ];

    let tabs = [
        { id: 1, name: "Parameters", active: true, type: "parameters" },
        { id: 2, name: "Code Snippets", active: false, type: "code_snippets" },
        { id: 3, name: "Images", active: false, type: "image" },
    ];
    let params = [
        { param: "label", description: "Button label text", required: true },
        { param: "size", description: "Button size (small, medium, large)", required: false },
        { param: "color", description: "Button color", required: false }
    ];
    let snippets = [
        {
            file_name: "Button.js",
            snippet:
                `import React from 'react';\n\nfunction Button({ label, onClick }) {\n  return (\n    <button onClick={onClick}>\n      {label}\n    </button>\n  );\n}\n\nexport default Button;`
        },
        {
            file_name: "Button.css",
            snippet:
                `.button {\n  background-color: #4CAF50;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}`
        }
    ];


    // Render the details.ejs file, passing the data
    res.render('index', { pics, tabs, params, snippets });
});


// Example of returning HTML using AJAX
app.get('/', (req, res) => {
  const tag = req.query.tag;
  // ... query your database and get component based on the `tag` ...
  // lets say components looks like this:

  let component = {
      name: "Example Component",
      type: "Button",
      tags: ["ui", "button", "example"],
      programming_language: "JavaScript"
  }
  let pics = [{pic_path: "pic1.png"}];
  let params = [{param: "label", description: "button label", required: true}]
  let snippets = [{file_name: "code1.js", snippet: "console.log('hi');"}];


  if (tag) {
      if (tag.length > 0 && component.tags.filter(x=>x.includes(tag)).length == 0) {
          component = null;
          pics = [];
          params = [];
          snippets = [];
      }

  }
res.render('index', { component: component, pics: pics, params: params, snippets: snippets, tag: tag || "" });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});