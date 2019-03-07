const Rss = require('./format/rss'),
    moment = require('moment'),
    rssMomentFormat = 'ddd, DD MMM YYYY HH:mm:ss ZZ';

class CauCseFeed {
    constructor(webtoon) {
        this._webtoon = webtoon
    }

    async rss() {
        await this._webtoon.init();
        let webtoonInfo = await this._webtoon.info();
        let episodes = await this._webtoon.parse();
        let rss = new Rss({
            title: webtoonInfo.title,
            description: webtoonInfo.description,
            link: webtoonInfo.url,
            lastBuildDate: moment().format(rssMomentFormat),
            ttl: 30
        });
        rss.setChannelImage(webtoonInfo.thumbnail, webtoonInfo.title, webtoonInfo.url);
        if (episodes.length > 25) episodes = episodes.slice(0, 25);
        for (let episode of episodes) {
            let description = `[${episode.episodeNo}] ${episode.title}`
            if (this._webtoon.getEpisodeInfo)
                description += `\n${(await this._webtoon.getEpisodeInfo(episode)).authorComment}`;
            rss.addItem({
                title: episode.title,
                description: description,
                link: episode.url,
                guid: episode.url,
                pubDate: episode.uploadDate.format(rssMomentFormat)
            })
        }
        return rss.generate()
    }
}