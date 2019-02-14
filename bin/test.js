#!node
'use strict';

const NaverWebtoon = require('../src/parsers/naver'),
      DaumWebtoon = require('../src/parsers/daum');
async function testWebtoon(webtoon) {
    const util = require('util');

    let episodes = await webtoon.parse();
    console.log('episodes:')
    console.log(util.inspect(episodes, false, null, true)) // {thumbnail, title, ranking, uploadDate, url, id, episodeNo}
    
    let imgs = await webtoon.getImages(episodes[0])
    console.log('imgs of latest episode:');
    console.log(util.inspect(imgs, false, null, true)) // [string]

    let info = await webtoon.info();
    console.log('webtoon info:');
    console.log(util.inspect(info, false, null, true)) // {title, description, author, thumbnail }
}
(async() => {
    console.log('naver webtoon 566902');

    let naverWebtoon = new NaverWebtoon(566902)
    await testWebtoon(naverWebtoon)
    
    console.log('daum webtoon kindergarten')

    let daumWebtoon = new DaumWebtoon('kindergarten')
    await testWebtoon(daumWebtoon)
})();