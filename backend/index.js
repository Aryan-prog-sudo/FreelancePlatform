const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/projects',    require('./routes/projects'));
app.use('/api/bids',        require('./routes/bids'));
app.use('/api/contracts',   require('./routes/contracts'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/freelancers', require('./routes/freelancers'));
app.use('/api/artists',     require('./routes/artists'));

app.listen(3001, () => console.log('✅ Backend running at http://localhost:3001'));