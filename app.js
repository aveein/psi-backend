
const express = require('express');
const db = require('./db');
const BlackListController = require('./controllers/BlackListController');
const app = express();
const cors = require('cors');
const User = require("./models/User");

const port = 3001;
db.authenticate();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/users', async(req, res) => {
  const users = await User.findAll();
  
  res.json(users);
});

app.get('/api/blacklist',BlackListController.getBlackList);

app.post('/api/blacklist',BlackListController.addToBlackList);


app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});