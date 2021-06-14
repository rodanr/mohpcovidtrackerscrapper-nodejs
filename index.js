const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = 3000;
const xPathForNewCases = "/html/body/div[2]/div[1]/div[2]/div[2]/div[1]/div/div/p[1]";
const xPathForRecovered = "/html/body/div[2]/div[1]/div[2]/div[2]/div[2]/div/div/p[1]";
const xPathForDeaths = "/html/body/div[2]/div[1]/div[2]/div[2]/div[3]/div/div/p[1]";
const xPathForDate = "/html/body/div[2]/div[1]/div[2]/div[1]/div/span/span/time";
var newCases="", recovered="", deaths="", date="";
async function getTheDataFromScraping() {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        }
        else {
            req.continue();
        }
    });
    await page.goto('https://covid19.mohp.gov.np/');
    await page.waitForXPath(xPathForNewCases);
    await page.waitForXPath(xPathForRecovered);
    await page.waitForXPath(xPathForDeaths);
    await page.waitForXPath(xPathForDate);
    let [newCasesElement] = await page.$x(xPathForNewCases);
    let [recoveredElement] = await page.$x(xPathForRecovered);
    let [deathsElement] = await page.$x(xPathForDeaths);
    let [dateElement] = await page.$x(xPathForDate);
    newCases = await page.evaluate(name => name.innerText, newCasesElement);
    recovered = await page.evaluate(name => name.innerText, recoveredElement);
    deaths = await page.evaluate(name => name.innerText, deathsElement);
    date = await page.evaluate(name => name.innerText, dateElement);
    browser.close();
}
app.get('/',(req, res)=>{
    if (newCases =="" || recovered ==""|| deaths==""||date==""){
        getTheDataFromScraping().then(()=>{
            res.json({
                "newCases": newCases,
                "recovered": recovered,
                "deaths": deaths,
                "date": date
            });
        });
    }
    else{
        res.json({
            "newCases": newCases,
            "recovered": recovered,
            "deaths": deaths,
            "date": date
        });
    }
});
app.get('/refresh', (req, res) => {
    getTheDataFromScraping().then(()=>{
        res.json({
            "newCases": newCases,
            "recovered": recovered,
            "deaths": deaths,
            "date": date
        });
    });
});


app.listen(process.env.PORT || port, () => console.log('Covid Mohp tracker listening'));