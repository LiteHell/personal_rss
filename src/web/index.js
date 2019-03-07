let express = require('express'),
    app = express(),
    CauNoticeFeed = require('../feed/cau/notice'),
    rssMime = 'application/rss+xml; charset=utf-8',
    atomMime = 'application/atom+xml; charset=utf-8';

app.get('/webtoon/:sitename/:webtoonId/:feedtype', (req, res) => {
    let webtoonClass;
    switch(req.params.sitename) {
        case 'naver':
            webtoonClass = require('../parsers/naver');
            break;
        case 'daum':
            webtoonClass = require('../parsers/daum');
            break;
        default:
            return res.status(400).type('html').end('<h1>Unsupported webtoon site</h1><p>Only daum and naver are supported.</p>')
    }
    let webtoon = new webtoonClass(req.params.webtoonId)
    let feed = new (require('../feed/webtoon'))(webtoon);
    switch(req.params.feedtype) {
        case 'rss':
            feed.rss().then(rss => {
                res.type(rssMime).end(rss)
            }).catch(err => {
                res.status(500).type('html').end('<h1>Server internal error</h1><p>why?</p>')
                console.error(err)
            })
            break;
        case 'atom':
            feed.atom().then(atom => {
                res.type(atomMime).end(atom)
            }).catch(err => {
                res.status(500).type('html').end('<h1>Server internal error</h1><p>why?</p>')
                console.error(err)
            })
            break;
        default:
            return res.status(400).type('html').end('<h1>Unsupported feedtype</h1><p>only atom and rss are supported</p>')
    }

});
app.get('/cau/notice', (req, res) => {
    let cauFeed = new CauNoticeFeed();
    cauFeed.torss().then(rss => {
        res.type(rssMime).end(rss)
    }).catch(err => {
        res.status(500).type('html').end('<h1>Server internal error</h1><p>why?</p>')
        console.error(err)
    })
})
app.get('/', (req, res) => {
    res.type('text/html').end(`<!DOCTYPE html>
    <html><head><title>Persoanl RSS</title><meta chartset="utf-8"></head><body><h1>RSS/Atom for personal use</h1>
    <p>for personal use. <a href="mailto:litehell@litehell.info">Written by LiteHell</a></p><h2>Webtoon</h2><p>Daum webtoonleague isn't supported.<br><code>/webtoon/[naver or daum]/[webtoon id]/[atom or rss]</code></p>
    <h2>CAU Notice</h2><p>rss format is served<br><code>/cau/notice</code></p>`)
})
app.get('/robots.txt', (req, res) =>{
    res.type('text/plain').end('User-agent: *\nDisallow: /');
})

module.exports = app;