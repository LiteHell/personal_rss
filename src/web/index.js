let express = require('express'),
    config = require('../../config.json'),
    path = require('path'),
    axios = require('axios'),
    app = express(),
    CauBoardFeed = require('../feed/cau/board'),
    redis = require('redis'),
    redisClient = redis.createClient(config.redisConfig),
    rssMime = 'application/rss+xml; charset=utf-8',
    atomMime = 'application/atom+xml; charset=utf-8';

const titles = {
    'cse': '소프트웨어학부 공지사항',
    'abeek': '공학인증혁신센터 공지사항',
    'sw': '다빈치sw교욱원 공지사항',
    'dormitory': '중앙대학교 서울캠퍼스 기숙사 공지사항'
};

app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, '../../static')));

app.get('/webtoon/daum/:viewerId/toWebtoonId', (req, res, next) => {
    let {viewerId} = req.params;
    req.cacheKey = `daum/${viewerId}/webtoonId`
    redisClient.get(req.cacheKey, (err, reply) => {
        if (err || reply == null)
            next();
        else
            res.type("application/json").end(reply);
    })
}, (req, res, next) => {
    let {viewerId} = req.params;
    axios.get(`http://webtoon.daum.net/data/pc/webtoon/viewer/${viewerId}`).then(response => {
        try {
            let resJson = JSON.stringify(response.data.data.webtoonEpisode.webtoon.nickname || null);
            res.type("application/json").end(resJson);
            redisClient.set(req.cacheKey, resJson, 'EX', 300);
        } catch (err) {
            res.type("application/json").end('null')
            next(err);
        }
    });
});
app.get('/webtoon/:sitename/:webtoonId/:feedtype', (req, res, next) => {
    let {sitename, webtoonId, feedtype} = req.params
    req.cacheKey = `${sitename}/${webtoonId}/${feedtype}`;
    redisClient.get(req.cacheKey, (err, reply) => {
        if (err || reply == null)
            next();
        else
            switch(feedtype) {
                case 'rss':
                    res.type(rssMime).end(reply)
                    break;
                case 'atom':
                    res.type(atomMime).end(reply)
                    break;
                default:
                    next(new Error("Unsupported feed type"));
            }
    });
}, (req, res, next) => {
    let webtoonClass;
    switch(req.params.sitename) {
        case 'naver':
            webtoonClass = require('../parsers/naver');
            break;
        case 'daum':
            webtoonClass = require('../parsers/daum');
            break;
        default:
            throw new Error("Unsupported webtoon site");
    }
    let webtoon = new webtoonClass(req.params.webtoonId)
    let feed = new (require('../feed/webtoon'))(webtoon);
    switch(req.params.feedtype) {
        case 'rss':
            feed.rss().then(rss => {
                redisClient.set(req.cacheKey, rss, 'EX', 300);
                res.type(rssMime).end(rss)
            }).catch(next)
            break;
        case 'atom':
            feed.atom().then(atom => {
                redisClient.set(req.cacheKey, atom, 'EX', 300);
                res.type(atomMime).end(atom)
            }).catch(next)
            break;
        default:
            throw new Error("Unsupported feed type");
    }

});
app.get('/cau/:parserName/:feedtype', (req, res, next) => {
    let {parserName, feedtype} = req.params
    req.cacheKey = `cau/${parserName}/${feedtype}`;
    redisClient.get(req.cacheKey, (err, reply) => {
        if (err || reply == null)
            next();
        else
            switch(feedtype) {
                case 'rss':
                    res.type(rssMime).end(reply)
                    break;
                case 'atom':
                    res.type(atomMime).end(reply)
                    break;
                default:
                    next(new Error("Unsupported feed type"));
            }
    })
}, (req, res, next) => {
    let {parserName, feedtype} = req.params;
    // parserName, title, description, link
    if(!titles[parserName])
        throw new Error("Unsupported board");
    if(feedtype !== 'rss' && feedtype !== 'atom')
        throw new Error("Unsupported feed type");

    let boardFeed = new CauBoardFeed(parserName, titles[parserName], titles[parserName], `https://${feedtype}.cau.ac.kr`);
    boardFeed[feedtype]().then(result => {
        redisClient.set(req.cacheKey, result, 'EX', 300);
        res.type(feedtype === 'rss' ? rssMime : atomMime).end(result)
    }).catch(next)
    
});
app.get('/', (req, res) => {
    res.render('index', {cauTitles: titles});
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    if (!res.headersSent)
        res.status(500).render('error');
});
module.exports = app;