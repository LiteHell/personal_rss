/** 다음웹툰에 관한 클래스입니다.
 * @module webtoon/daum
 */

'use strict';

const axios = require('axios'),
      moment = require('moment');

/** @description 특정 다음웹툰의 에피소드 목록 및 정보를 얻거나 에피소드의 이미지주소를 불러오는 클래스입니다.
 * @class
 * @export
*/
class DaumWebtoon {
    /**
     * 웹툰 ID를 받아 클래스를 생성합니다.
     * @constructor
     * @param {string} webtoonId 웹툰의 고유한 ID입니다. 일반적으로 http://webtoon.daum.net/webtoon/view/A에서 A부분이 ID입니다. 예시를 들어 "유치원의 하루"의 경우 kindergarten입니다.
     */
    constructor(webtoonId) {
        this.webtoonId = webtoonId
    }
    /**
     * 특정 에피소드의 이미지주소들을 얻습니다.
     * @async
     * @param {object} _episodeId 이미지주소들을 얻고자 하는 에피소드의 객체입니다. id 속성을 가지고 있어야 합니다.
     * @param {string} _episodeId 이미지주소들을 얻고자 하는 에피소드의 id입니다.
     */
    async getImages(_episodeId) {
        let episodeId = _episodeId.id ? _episodeId.id : _episodeId
        let response = await axios.get(`http://webtoon.daum.net/data/pc/webtoon/viewer_images/${episodeId}`);
        let images = response.data.data;

        return images.map(item => item.url);
    }
    /**
     * 정보를 가져옵니다.
     * @async
     */
    async info() {
        let webtoonId = this.webtoonId
        let response = await axios.get('http://webtoon.daum.net/data/pc/webtoon/view/' + webtoonId + '?timestamp=' + Date.now())
        let webtoonData = response.data.data.webtoon;
        
        return {
            title: webtoonData.title,
            description: webtoonData.introduction,
            author: webtoonData.cp.name,
            thumbnail: (webtoonData.appThumbnailImage || webtoonData.pcThumbnailImage).url,
            url: 'http://webtoon.daum.net/webtoon/view/' + this.webtoonId,
            sitename: 'daum'
        }
        // title, author, description, thumbnail
    }
    async init() {
        
    }
    /**
     * 에피소드 목록을 가져옵니다.
     * @async
     */
    async parse() {
        let webtoonId = this.webtoonId
        let response = await axios.get('http://webtoon.daum.net/data/pc/webtoon/view/' + webtoonId)
        let webtoonData = response.data.data;

        let episodes = webtoonData.webtoon.webtoonEpisodes.filter(item => item.serviceType === "free");
        let result = [];
        for(let episode of episodes) {
            let thumbnail = episode.thumbnailImage.url,
                title = episode.title,
                ranking = null,
                uploadDate = moment(episode.dateCreated, "YYYYMMDDHHmmss").toDate(),
                id = episode.articleId,
                url = 'http://webtoon.daum.net/webtoon/viewer/' + id,
                episodeNo = episode.episode;
            result.push({thumbnail, title, ranking, uploadDate, url, id, episodeNo});
        }
        return result;
    }
}

module.exports = DaumWebtoon;