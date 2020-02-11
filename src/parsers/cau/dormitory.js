const axios = require('axios'),
      cheerio = require('cheerio'),
      moment = require('moment'),
      iconv = require('iconv-lite');

class CauDormitoryNotice {
    constructor() {

    }
    async getList() {
        let res = await axios({
                url:'http://dormitory.cau.ac.kr/bbs/bbs_list.php?bbsID=notice&pNum=3146',
                responseType: "arraybuffer",
                responseEncoding: "binary"
            }),
            $ = cheerio.load(iconv.decode(res.data, 'euc-kr')),
            result = [];
        
        let articles = $("table.tbl_board tr:has(td.t_c)");
        for(let i = 0; i < articles.length; i++) {
            let article = $(articles[i]);
            let tds = article.find("td")
            
            result.push({
                url:  $(tds[1]).find("a").attr("href"),
                title: $(tds[1]).find("a").text().trim(),
                author : null,
                date: moment($(tds[4]).text().trim(), 'YY.MM.DD').toDate()
            });
        }
        return result;
    }
    async getArticle(url) {
        let res = await axios({url,responseType: "arraybuffer",responseEncoding: "binary"}),
            $ = cheerio.load(iconv.decode(res.data, 'euc-kr')),
            files = [];
        
        let trs = $($('table.tbl_board tbody')[1]).find("tr");
        let fileLinks = $($(trs[1]).find('td')[3]).find('a');
        if (fileLinks.length > 0) {
            let pattern = /bbsDownload\(['"]([0-9]+)['"]\)/;
            for(let i = 0; i < fileLinks.length; i++) {
                let fileTag = $(fileLinks[i]);
                files.push({
                    name: fileTag.text().trim(),
                    url: 'https://dormitory.cau.ac.kr/bbs/bbs_download.php?num=' + pattern.exec(fileTag.attr('a'))[1]
                })
            }
        }
        $('section#content .detail .files').remove();
        return {
            content: $($(trs[5]).find('td')[0]).html(),
            files
        }
    }
}

module.exports = CauDormitoryNotice;