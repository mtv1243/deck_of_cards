const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const fs = require('fs');
const fsPromises = require('fs').promises;

let gameKey;


const app = express();

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.urlencoded({extended:false}));
app.use('/public', express.static("public"));

app.get('/', (req, res, next) => {
    res.render('intro');
})

// create a new game key
app.post('/game', (req, res, next) => {
    gameKey = Math.round(Math.random() * 100);

    // use node FS promises to complete the file creation before redirect
    fsPromises.readFile('./views/index.ejs')
        .then((buffer) => {
            const oldContent = buffer.toString();
            return fsPromises.appendFile(`./views/gameFiles/game_${gameKey}.ejs`, oldContent);
        })
        .then(() => {
            res.redirect('/game/' + gameKey);
            next();
        })

      // let indexContent = fs.readFile('./views/index.ejs', (err, data) => {
    //     if(err) throw err; 
    //     console.log(data);
    //     return data.toString(); 
    // })

    // fs.writeFileSync(`./views/gameFiles/game_${gameKey}.html`, indexContents);

    // create HTML file with gameKey in filename
    // var newHTML = fs.createWriteStream(`./views/gameFiles/game_${gameKey}.ejs`);
    // newHTML.write(indexContents);
    // newHTML.end();

    // add the gameKey to the response (maybe unnecessary)
    // res.locals.gameKey = gameKey;
    // console.log('gameKey: ', res.locals.gameKey);
})

// listen for get at the url generated in the previous middleware

app.post('/find-game', (req, res, next) => {
    res.redirect(`/game/${req.body.gameKey}`);
})

app.get('/game/:url', (req, res, next) => {

    let url = req.url.substr(6);
    console.log('url = ' + url);
    // change this to andle any get to /game and then read the req url to dtermine what HTML file to serve

    // console.log(res.locals.gameKey);
    res.render(`./gameFiles/game_${url}`, {
        gameNum: url 
    });
})


/*
app.get('/', function(req, res){
//render homepage here
});
app.post('/', function(req,res){
// handle creating temp pages here and
// redirect client to that page
// save ID of the page to db
});
app.get('/:pageId', function(req,res){
// handle rendering the temp page by ID
});
app.post('/destroy', function(req,res){
// remove page from db
});
*/

app.listen(3000)