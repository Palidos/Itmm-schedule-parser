const express = require('express');
const app = express();
const methodOverride = require('method-override');
const fs = require("fs");
const rp = require('request-promise');
const $ = require('cheerio');

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

const savedFile = "./data/date.json"
const url = 'http://www.itmm.unn.ru/studentam/raspisanie/raspisanie-bakalavriata-i-spetsialiteta-ochnoj-formy-obucheniya/';

const port = 8080;
app.listen(port, () => console.log(`Server started on port ${port}`));

function updateScheduleFile(date) {
      //Clean file and then save date to it

    fs.writeFile(savedFile, "", (err) => {
      if (err) throw err;
    });
    fs.writeFile(savedFile, JSON.stringify(date), (err) => {
      if (err) throw err;
    });
}

let currDate;

function getCurrentDate() {
  return Promise.resolve(rp(url))
  .then(html => {
    return {
      date: $('.pagetext > div > p', html).contents().last().text(),
      link: $('.pagetext > div > p > a', html)[3].attribs.href
    };
  })
  .catch(err => {
    if (err)
      console.log(err);
  });
}


function getLastDate() {
  return JSON.parse(fs.readFileSync('./data/date.json'), (err, data) => {
    if (err) throw err;
    return data;
  });
}


app.locals.check = function checkSchedule() {
  const lastUpdateDate = getLastDate();
  getCurrentDate().then((info)=> {
    app.locals.info = info;
    if(info.date == lastUpdateDate) {
      console.log("Old schedule");
      app.locals.isNew = false;
    } else {
      console.log("New schedule!!!");
      app.locals.isNew = true;
      updateScheduleFile(info.date);
    }
  })
  .catch(err => {
    if (err)
      console.log(err);
  });
}

app.get('/', (req, res) => {
    res.render('index');
});

app.locals.check();

