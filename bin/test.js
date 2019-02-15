#!node
'use strict';

const NaverWebtoon = require('../src/parsers/naver'),
      DaumWebtoon = require('../src/parsers/daum'),
      WebtoonFeed = require('../src/feed/webtoon'),
      path = require('path'),
      fs = require('fs');
async function testWebtoon(webtoon) {
    const util = require('util');

    let info = await webtoon.info();
    console.log('webtoon info:');
    console.log(util.inspect(info, false, null, true)) // {title, description, author, thumbnail }

    let episodes = await webtoon.parse();
    console.log('episodes:')
    console.log(util.inspect(episodes, false, null, true)) // {thumbnail, title, ranking, uploadDate, url, id, episodeNo}
    
    let imgs = await webtoon.getImages(episodes[0])
    console.log('imgs of latest episode:');
    console.log(util.inspect(imgs, false, null, true)) // [string]

    let webtoonFeed = new WebtoonFeed(webtoon)
    console.log('writing rss')
    fs.writeFileSync(path.join(__dirname, `../test/${info.sitename}_${webtoon.webtoonId}_rss.xml`), await webtoonFeed.rss(), {encoding: 'utf8', flag:'w+'})
    console.log('writing atom')
    fs.writeFileSync(path.join(__dirname, `../test/${info.sitename}_${webtoon.webtoonId}_atom.xml`), await webtoonFeed.atom(), {encoding: 'utf8', flag:'w+'})
    console.log('done')
}
(async() => {
    console.log('naver webtoon 566902');

    let naverWebtoon = new NaverWebtoon(566902)
    await testWebtoon(naverWebtoon)
    
    console.log('daum webtoon kindergarten')

    let daumWebtoon = new DaumWebtoon('kindergarten')
    await testWebtoon(daumWebtoon)
})();