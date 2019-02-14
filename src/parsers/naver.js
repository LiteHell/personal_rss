'use strict';

const cheerio = require('cheerio'),
      axios = require('axios'),
      moment = require('moment');

class NaverWebtoon {
    constructor(webtoonId) {
        this.webtoonId = webtoonId
    }
    async info() {
        let webtoonId = this.webtoonId
        let url = 'https://comic.naver.com/webtoon/list.nhn?titleId=' + webtoonId;
        let response = await axios.get(url)
        let responseText = response.data;
        let $ = cheerio.load(responseText);

        let author = $('.comicinfo .detail h2 .wrt_nm').text().trim();
        $('.comicinfo .detail h2 .wrt_nm').remove();
        let title = $('.comicinfo .detail h2').text().trim(),
            description = $('.comicinfo .detail > p').text().trim(),
            thumbnail = $('.comicinfo .thumb a img').attr('src');
        return {title, author, description, thumbnail, url, sitename: 'naver'}

    }
    async getImages(_episodeId) {
        let episodeId = _episodeId.id ? _episodeId.id : _episodeId
        let response = await axios.get(`https://comic.naver.com/bestChallenge/detail.nhn?titleId=${this.webtoonId}&no=${episodeId}`);
        let responseText = response.data;
        let $ = cheerio.load(responseText)

        let episodes = $('.wt_viewer img');
        let result = [];
        for(let i = 0; i < episodes.length; i++) {
            let episode = $(episodes[i]);
            result.push(episode.attr('src'))
        }
        return result;
    }
    async parse() {
        let webtoonId = this.webtoonId
        let response = await axios.get('https://comic.naver.com/webtoon/list.nhn?titleId=' + webtoonId)
        let responseText = response.data;
        let $ = cheerio.load(responseText);

        let episodes = $('table.viewList tbody tr:not(.band_banner)');
        let result = [];
        for(let i = 0; i < episodes.length; i++) {
            let episode = $(episodes[i])
            let thumbnail = episode.find('td a img').attr('src'),
                title = episode.find('td.title a').text().trim(),
                ranking = parseFloat(episode.find('td .rating_type strong').text().trim()),
                uploadDate = moment(episode.find('td.num').text(), "YYYY-MM-DD").toISOString(),
                url = 'https://comic.naver.com' + episode.find('td.title a').attr('href'),
                id = /[\?&]?no=([0-9]+)/.exec(url)[1]
            result.push({thumbnail, title, ranking, uploadDate, url, id, episodeNo: parseInt(id)});
        }
        return result;
    }
}

module.exports = NaverWebtoon;