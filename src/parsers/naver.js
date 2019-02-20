'use strict';

const cheerio = require('cheerio'),
      axios = require('axios'),
      moment = require('moment');

class NaverWebtoon {
    constructor(webtoonId) {
        this.webtoonId = webtoonId
        this._inited = false;
    }
    async init() {
        if(this._inited) return;
        let {leagueType} = await this.info();
        this.leagueType = leagueType;
        this._inited = true;
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
            thumbnail = $('.comicinfo .thumb a img').attr('src'),
            leagueType = /^\/([a-zA-Z]+)\//.exec($($('.viewList tbody tr td.title a').get(0)).attr('href'))[1];
        return {title, author, description, thumbnail, url, sitename: 'naver', leagueType}

    }
    async getImages(_episodeId) {
        let episodeId = _episodeId.id ? _episodeId.id : _episodeId
        let response = await axios.get(`https://comic.naver.com/${this.leagueType}/detail.nhn?titleId=${this.webtoonId}&no=${episodeId}`);
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
    async getEpisodeInfo(_episodeId) {
        let episodeId = _episodeId.id ? _episodeId.id : _episodeId
        let response = await axios.get(`https://comic.naver.com/${this.leagueType}/detail.nhn?titleId=${this.webtoonId}&no=${episodeId}`);
        let responseText = response.data;
        let $ = cheerio.load(responseText)
        
        let authorComment = $('.writer_info > p').text()
        return {authorComment};
    }
    async parse() {
        let webtoonId = this.webtoonId
        let response = await axios.get(`https://comic.naver.com/${this.leagueType}/list.nhn?titleId=${webtoonId}`)
        let responseText = response.data;
        let $ = cheerio.load(responseText);

        let episodes = $('table.viewList tbody tr:not(.band_banner)');
        let result = [];
        for(let i = 0; i < episodes.length; i++) {
            let episode = $(episodes[i])
            let thumbnail = episode.find('td a img').attr('src'),
                title = episode.find('td.title a').text().trim(),
                ranking = parseFloat(episode.find('td .rating_type strong').text().trim()),
                uploadDate = moment(episode.find('td.num').text(), "YYYY-MM-DD"),
                url = 'https://comic.naver.com' + episode.find('td.title a').attr('href'),
                id = /[\?&]?no=([0-9]+)/.exec(url)[1]
            result.push({thumbnail, title, ranking, uploadDate, url, id, episodeNo: parseInt(id)});
        }
        return result;
    }
}

module.exports = NaverWebtoon;