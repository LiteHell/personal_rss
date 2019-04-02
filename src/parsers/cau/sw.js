const axios = require('axios'),
      cheerio = require('cheerio'),
      moment = require('moment'),
      url = require('url');

class CauSwNotice {
    constructor() {

    }
    async getList() {
        let res = await axios('https://sw.cau.ac.kr/board/list?boardtypeid=7&menuid=001005005'),
            $ = cheerio.load(res.data),
            result = [];
        
        let articles = $("#boardForm table tbody tr");
        for(let i = 0; i < articles.length; i++) {
            let article = $(articles[i]),
                tds = article.find('td');
            result.push({
                url: url.resolve('https://sw.cau.ac.kr/board/list',article.find('td.tl a').attr('href')),
                title: article.find('td.tl a').text().trim(),
                author : null,
                date: moment($(tds[2]).text().trim(), 'YYYY-MM-DD').toDate()
            });
        }
        return result;
    }
    async getArticle(url) {
        let res = await axios(url),
            $ = cheerio.load(res.data),
            files = [];
        
        let fileTags = $('#boardForm table tbody tr:first-child td[colspan] a');
        if (fileTags.length > 0) {
            for(let i = 0; i < fileTags.length; i++) {
                let fileTag = $(fileTags[i]);
                files.push({
                    name: fileTag.text().trim(),
                    url: require('url').resolve(url, fileTag.attr('href'))
                })
            }
        }
        return {
            content: $('#boardForm table tbody td.editTd').html(),
            files
        }
    }
}

module.exports = CauSwNotice;