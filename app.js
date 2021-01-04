const express = require("express");
const app = express()
let path = require('path');
const fs = require('fs');
const mergeJSON = require("merge-json");

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    let maindata = JSON.parse(fs.readFileSync('json/main.json'));
    let projectdata = JSON.parse(fs.readFileSync('json/projects.json'));
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));

    let data = mergeJSON.merge(mergeJSON.merge(maindata, projectdata), globaldata);
    res.render('main', data);
});

app.get('/pathfinder', (req, res) => {
    let maindata = JSON.parse(fs.readFileSync('json/main.json'));
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));
    let pathfinderdata = JSON.parse(fs.readFileSync('json/pathfinder.json'));

    let data = mergeJSON.merge(mergeJSON.merge(maindata, pathfinderdata), globaldata);
    res.render('pathfinder', data);
});

app.get('/project', (req, res) => {
    const slug = req.query.slug;
    var projects = JSON.parse(fs.readFileSync('json/projects.json')).projects;
    let projdata = null;
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));
    for (let i = 0; i < projects.length; i += 1) {
        if (projects[i].slug == slug) {
            projdata = projects[i];
            break;
        }
    }

    let data = mergeJSON.merge(globaldata, projdata);
    res.render('project', data);
});

app.get('/resume', (req, res) => {
    let maindata = JSON.parse(fs.readFileSync('json/main.json'));
    let projectdata = JSON.parse(fs.readFileSync('json/projects.json'));
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));

    let data = mergeJSON.merge(mergeJSON.merge(maindata, projectdata), globaldata);
    
    res.render('resume', data);
})

app.get('/sorter', (req, res) => {
    let maindata = JSON.parse(fs.readFileSync('json/main.json'));
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));
    let sorterdata = JSON.parse(fs.readFileSync('json/sorter.json'));

    let data = mergeJSON.merge(mergeJSON.merge(maindata, sorterdata), globaldata);
    res.render('sorter', data);
})

app.listen(PORT, () => {
    console.log(`App listening on port 3000`)
});