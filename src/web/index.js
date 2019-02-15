let express = require('express'),
    app = express();

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
            return res.status(400).end('<h1>Unsupported webtoon site</h1><p>Only daum and naver are supported.</p>')
    }
    let webtoon = new webtoonClass(req.params.webtoonId)
    let feed = new (require('../feed/webtoon'))(webtoon);
    switch(req.params.feedtype) {
        case 'rss':
            feed.rss().then(rss => {
                res.type('application/rss+xml').end(rss)
            })
            break;
        case 'atom':
            feed.rss().then(atom => {
                res.type('application/atom+xml').end(atom)
            })
            break;
        default:
            return res.status(400).end('<h1>Unsupported feedtype</h1><p>only atom and rss are supported</p>')
    }

});

module.exports = app;