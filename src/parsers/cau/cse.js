const axios = require('axios'),
      cheerio = require('cheerio'),
      moment = require('moment');

class CauCseNotice {
    constructor() {

    }
    async getList() {
        let res = await axios('http://cse.cau.ac.kr/sub05/sub0501.php'),
            $ = cheerio.load(res.data),
            result = [];
        
        let articles = $("#listpage_form tbody tr");
        for(let i = 0; i < articles.length; i++) {
            let article = $(articles[i]),
                pcOnlyTds = article.find('td.pc-only')
            result.push({
                url: article.find('td.aleft a').attr('href'),
                author : $(pcOnlyTds[2]).text(),
                date: moment($(pcOnlyTds[3]).text().trim(), 'YYYY.MM.DD').toDate()
            });
        }
    }
    async getArticle(url) {
        let res = await axios(url),
            $ = cheerio.load(res.data),
            files = [];
        
        let fileTags = $('section#content .detail .files span');
        if (fileTags.length > 0) {
            for(let i = 0; i < fileTags.length; i++) {
                let fileTag = $(filesTags[i]);
                files.push({
                    name: fileTag.text(),
                    url: fileTag.attr('onclick').replace(/goLocation\(['"](.+?)['"] ?, ?['"](.+?)['"] ?, ?['"](.+?)['"]\)/, '$1?uid=$2&code=$3')
                })
            }
        }
        return {
            content: $('section#content .detail').html(),
            files
        }
    }
}