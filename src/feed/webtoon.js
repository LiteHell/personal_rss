const Feed = require('feed').Feed,
    moment = require('moment'),
    rssMomentFormat = 'ddd, DD MMM YYYY HH:mm:ss ZZ';

class WebtoonFeed {
    constructor(webtoon) {
        this._webtoon = webtoon
    }

    async createFeed() {
        await this._webtoon.init();
        let webtoonInfo = await this._webtoon.info();
        let episodes = await this._webtoon.parse();
        let feed = new Feed({
            title: webtoonInfo.title,
            description: webtoonInfo.description,
            id: webtoonInfo.url,
            link: webtoonInfo.url,
            language: "ko-KR",
            image: webtoonInfo.thumbnail,
            updated: new Date(episodes[0].uploadDate),
            generator: "LiteHell's personal generator, written in node.js",
            feedLinks: {
                atom: `https://rss.litehell.info/webtoon/${webtoonInfo.sitename}/${this._webtoon.webtoonId}/atom`,
                rss: `https://rss.litehell.info/webtoon/${webtoonInfo.sitename}/${this._webtoon.webtoonId}/rss`
            },
            atuhor: {
                name: webtoonInfo.author
            }
        });

        for (let i = 0; i < episodes.length; i++) {
            let episode = episodes[i];
            let description = `[${episode.episodeNo}] ${episode.title}`, authorComment = null;
            let htmlContent = '<style>.webtoonImages img {display: block; width: 100%;}</style><div class="webtoonImages>';
            if (this._webtoon.getEpisodeInfo)
                authorComment = (await this._webtoon.getEpisodeInfo(episode)).authorComment;
            let images = await this._webtoon.getImages(episode);
            for (let j = 0; j < images.length; j++)
                htmlContent += `<img src="${images[j]}></img>`;
            htmlContent += "</div>";
            if (authorComment)
                htmlContent += `<div class="authorComment">${authorComment}</div>`
            feed.addItem({
                title: episode.title,
                id: episode.url,
                link: episode.url,
                description: authorComment ? authorComment : description,
                content: htmlContent,
                author: [
                    {
                        name: webtoonInfo.author
                    }
                ],
                image: episode.thumbnail,
                date: episode.uploadDate
            })
        }

        return feed;
    }

    async rss() {
        let feed = await this.createFeed();
        return feed.rss2()
    }

    async atom() {
        let feed = await this.createFeed();
        return feed.atom1()
    }
}

module.exports = WebtoonFeed;