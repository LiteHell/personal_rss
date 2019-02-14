const Rss = require('./format/rss');

class WebtoonFeed {
    constructor(webtoon) {
        this._webtoon = webtoon
    }

    async rss() {
        let webtoonInfo = await this._webtoon.info();
        let episodes = await this._webtoon.parse();
        let rss = new Rss({
            title: webtoonInfo.title,
            description: webtoonInfo.description,
            link: webtoonInfo.url,
            lastBuildDate: (new Date()).toString(),
            ttl: 30
        });
        rss.setChannelImage(webtoonInfo.thumbnail, webtoonInfo.title, webtoonInfo.url);
        if(episodes.length > 25) episodes = episodes.slice(0, 25);
        for(let episode of episodes) {
            rss.addItem({
                title: episode.title,
                description: `[${episode.episodeNo}] ${episode.title}`,
                link: episode.url,
                guid: 'webtoon-' + webtoonInfo.sitename + '-' + this._webtoon.webtoonId + '-' + episode.id,
                pubDate: episode.uploadDate
            })
        }
        return rss.generate()
    }
}

module.exports = WebtoonFeed;