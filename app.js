import fetch from 'node-fetch'
import express from 'express'
import path from 'path'
import fs from 'fs'
import mergeJSON from 'merge-json'

const app = express()
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Front-end page routes

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

app.get('/sorter', (req, res) => {
    let maindata = JSON.parse(fs.readFileSync('json/main.json'));
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));
    let sorterdata = JSON.parse(fs.readFileSync('json/sorter.json'));

    let data = mergeJSON.merge(mergeJSON.merge(maindata, sorterdata), globaldata);
    res.render('sorter', data);
});

app.get('/tracer', (req, res) => {
    let maindata = JSON.parse(fs.readFileSync('json/main.json'));
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));
    let tracerdata = JSON.parse(fs.readFileSync('json/tracer.json'));

    let data = mergeJSON.merge(mergeJSON.merge(maindata, tracerdata), globaldata);
    res.render('tracer', data);
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
});

app.get('/cs61b', (req, res) => {
    let maindata = JSON.parse(fs.readFileSync('json/main.json'));
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));

    let data = mergeJSON.merge(maindata, globaldata);
    res.render('csm_cs61b', data);
});

app.get('/path', (req, res) => {
    let maindata = JSON.parse(fs.readFileSync('json/main.json'));
    let globaldata = JSON.parse(fs.readFileSync('json/global.json'));

    let data = mergeJSON.merge(maindata, globaldata);
    res.render('path', data);
});

app.get('/files/:file', (req, res) => {
    res.sendFile(`./public/files/${req.params.file}`);
});

// Back-end routes

app.get('/pathDepartures', async (req, res) => {
    const pathDepartureURL = "https://www.panynj.gov/bin/portauthority/ridepath.json";
    const response = await fetch(`${pathDepartureURL}?timeStamp=${req.params.timeStamp}`);
    const data = await response.json();
    res.header("Access-Control-Allow-Origin", "*");
    res.json(data);
});

app.get('/pathAlerts', async (req, res) => {
    const pathAlertsURL = "https://www.panynj.gov/bin/portauthority/everbridge/incidents?status=All&department=Path";
    const response = await fetch(`${pathDepartureURL}`);
    const data = await response.json();
    res.header("Access-Control-Allow-Origin", "*");
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`App listening on port 3000`)
});
