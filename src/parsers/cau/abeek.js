const axios = require('axios'),
      cheerio = require('cheerio'),
      moment = require('moment'),
      url = require('url');

class CauAbeekNotice {
    constructor() {

    }
    async getList() {
        let res = await axios('https://abeek.cau.ac.kr/notice/list.jsp?sc_board_seq=1&page=1'),
            $ = cheerio.load(res.data),
            result = [];
        
        let articles = $("#contents table tbody tr");
        for(let i = 0; i < articles.length; i++) {
            let article = $(articles[i]),
                tds = article.find('td');
            result.push({
                url: `https://abeek.cau.ac.kr/notice/view.jsp?sc_board_seq=1&pk_seq=${article.find('td.left a').attr('seq')}`,
                title: article.find('td.left a').text().trim(),
                author : null,
                date: moment($(tds[3]).text().trim(), 'YYYY.MM.DD').toDate()
            });
        }

        return result;
    }
    async getArticle(url) {
        let res = await axios(url),
            $ = cheerio.load(res.data),
            files = [];
        
        let viewListTds = $('#contents table tr.view_list');
        for(let i = 1; i < viewListTds.length; i++) {
            let fileTag = $($(viewListTds[i]).find('td a'));
            files.push({
                name: fileTag.text().trim(),
                url: url.resolve(url, fileTag.href())
            })
        }
        return {
            content: $('#contents table tr.view_text table td').html(),
            author: $(viewListTds.find('td')[0]).text(),
            files
        }
    }
}

module.exports = CauAbeekNotice;