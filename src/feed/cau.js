const axios = require('axios'),
      querystring = require('querystring');

class CauFeed {
    constructor() {

    }
    async torss() {
        let formData = {
            pageNo: 1,
            pagePerCnt: 30,
            MENU_ID: 100,
            SITE_NO: 2,
            BOARD_SEQ: 4,
            S_CATE_SEQ: '',
            BOARD_TYPE: 'C0301',
            BOARD_CATEGORY_NO: '',
            P_TAB_NO: '',
            TAB_NO: '',
            P_CATE_SEQ: '',
            CATE_SEQ: '',
            SEARCH_FLD: 'SUBJECT',
            SEARCH: ''
        }
        let response = await axios({
            method: 'POST', 
            url:'https://www.cau.ac.kr/cms/FR_PRO_CON/BoardRss.do',
            data: querystring.stringify(formData),
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    }
}

module.exports = CauFeed;