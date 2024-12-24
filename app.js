// app.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const componentController = require('./controllers/componentController');
const errorHandler = require('./middleware/errorHandler');
const multer = require('multer');


// Set up the view engine
app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, 'public')));

// Parse JSON and url encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'public', 'images'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

const upload = multer({ storage: storage });
// Main route for component information
app.get('/', componentController.getAllComponents);

app.get('/component-details', componentController.getComponentDetails );
app.get('/update-component', componentController.getUpdateComponent);

// Route to render new component creation form
app.get('/new', componentController.getNewFormComponent);
app.post('/update-component', upload.array('new_pics'), componentController.postUpdateComponent);



// Route to handle component submission
app.post('/submit-component',
  upload.fields([{ name: 'pics_1' }, { name: 'pics_2' }, { name: 'pics_3' }, { name: 'pics_4' },
    { name: 'pics_5' }, { name: 'pics_6' }, { name: 'pics_7' }, { name: 'pics_8' },
    { name: 'pics_9' }, { name: 'pics_10' }])
  ,componentController.submitComponent);

// Centralized error handling middleware
app.use(errorHandler);


// Start the server
app.listen(port,'0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});