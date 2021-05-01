const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const { query, request } = require('express');
const bodyParser = require('body-parser');
const { checkSubstring } = require('./utils');

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

let loggedin = false;

app.get('/', async (req, res) => {
    if (loggedin) {
        try {
            let description = req.query.description ? req.query.description : '';
            let location = req.query.location ? req.query.location : '';
            let fullTime = req.query.full_time ? 
                            req.query.full_time === 'true' ? 
                                true 
                                : false
                            : false;
    
            let positions = await axios.get(`https://jobs.github.com/positions.json`);
    
            positions.data = positions.data.filter((e) => {
                let filtered = true;
                location = location.charAt(0).toUpperCase() + location.slice(1);
    
                if (e.description.indexOf(description) < 0) {
                    filtered = false;
                }
                if (e.location.indexOf(location) < 0) filtered = false;
                
                if ((fullTime && e.type === 'Full Time')) {
                    filtered = filtered && true;
                } else if (!fullTime && e.type !== 'Full Time') {
                    filtered = filtered && true;
                } else {
                    filtered = false;
                }
                return filtered;
            })
            res.send(positions.data);
        } catch (e) {
            console.log(e);
            res.send(e);
        }
    } else {
        res.send('You are not logged in');
    }
})

app.get('/job-detail/:id', async (req, res) => {
    if (loggedin) {
        try {
            let id = req.params.id;
            let jobDetail = await axios.get(`https://jobs.github.com/positions/${id}.json`)
            res.send(jobDetail.data);
        } catch (e) {
            console.log(e);
            res.send(e);
        }
    } else {
        res.send('You are not logged in');
    }
})

app.post('/login', (req, res) => {
    try {
        if (!loggedin) {
            let username = req.body.username;
            let password = req.body.password;
            if (username && password) {
                if (username === 'admin' && password === 'admin') {
                    loggedin = true;
                    res.send({
                        loggedin : true
                    });
                    res.end();
                } else {
                    res.send('Incorrect username or password');
                }
            } else {
                res.send('Incorrect username or password');
            }
        } else {
            res.send({
                loggedin : false
            });
        }
    } catch (e) {
        console.log(e);
        res.send(e);
    }
})

app.post('/logout', (req, res) => {
    loggedin = false;
    res.send({
        loggedout: true
    });
})

app.listen(3000, () => {
    console.log("Listening to port 3000");
})