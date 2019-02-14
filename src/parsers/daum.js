'use strict';

const axios = require('axios');

class DaumWebtoon {
    constructor(webtoonId) {
        this.webtoonId = webtoonId
    }
    async getImages(_episodeId) {
        let episodeId = _episodeId.id ? _episodeId.id : _episodeId
        let response = await axios.get(`http://webtoon.daum.net/data/pc/webtoon/viewer_images/${episodeId}`);
        let images = response.data.data;

        return images.map(item => item.url);
    }
    async info() {
        let webtoonId = this.webtoonId
        let response = await axios.get('http://webtoon.daum.net/data/pc/webtoon/view/' + webtoonId)
        let webtoonData = response.data.data.webtoon;
        
        return {
            title: webtoonData.title,
            description: webtoonData.introduction,
            author: webtoonData.cp.name,
            thumbnail: webtoonData.appThumbnailImage.url
        }
        // title, author, description, thumbnail
    }
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
                uploadDate = episode.dateCreated.substring(0, 8),
                id = episode.articleId,
                url = 'http://webtoon.daum.net/webtoon/viewer/' + id,
                episodeNo = episode.episode;
            result.push({thumbnail, title, ranking, uploadDate, url, id, episodeNo});
        }
        return result;
    }
}

module.exports = DaumWebtoon;