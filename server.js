'use strict';
const express    = require('express');
const path       = require('path');
const logger     = require('morgan');
const bodyParser = require('body-parser');
const neo4j      = require('neo4j-driver').v1;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

const driver  = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'm6699bat'));
const session = driver.session();

app.get('/', (req, res, next) =>
{
    session.run('MATCH(n:User) RETURN n LIMIT 25').then((result) =>
    {
        let userArr = [];
        result.records.forEach((record) =>
        {
            userArr.push({
                id: record._fields[0].identity.low, name: record._fields[0].properties.name,
            });
        });
        console.log(userArr);
        res.render('index', {
            users: userArr
        });
    }).catch((error) =>
    {
        console.log(error.message);
    });
});

app.post('/add/user', (req, res) =>
{
    let name = req.body.name;

    session.run('CREATE(n:User {name:{nameParam}}) RETURN n.name', {nameParam:name}).then(result => {
        res.redirect('/');

        session.close();
    }).catch(error =>
    {
        console.error(`Error has occurred ${error.message}`);
    });

    res.redirect('/');
});

app.listen(3000, () =>
{
    console.log('Server is running on port 3000')
});

module.exports = app;
