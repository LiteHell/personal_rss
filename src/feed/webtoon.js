const Rss = require('./format/rss'),
    Atom = require('./format/atom'),
    moment = require('moment'),
    rssMomentFormat = 'ddd, DD MMM YYYY HH:mm:ss ZZ';

class WebtoonFeed {
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

    async atom() {
        await this._webtoon.init();
        // title, subtitle, author := name, id, updated
        // entry := {title, link(href), id, updated, summary, content(type=html), author := {name, email}}

        let webtoonInfo = await this._webtoon.info();
        let episodes = await this._webtoon.parse();
        let atom = new Atom({
            title: webtoonInfo.title,
            subtitle: webtoonInfo.description,
            id: webtoonInfo.url,
            updated: episodes[0].uploadDate.toISOString(),
        });
        atom.setAuthor(webtoonInfo.author)
        if (episodes.length > 25) episodes = episodes.slice(0, 25);
        for (let episode of episodes) {
            let imgContents = [];
            let imgs = await this._webtoon.getImages(episode);
            let authorComment = null;
            if (this._webtoon.getEpisodeInfo)
                authorComment = (await this._webtoon.getEpisodeInfo(episode)).authorComment;
            for (let i = 0; i < imgs.length; i++) {
                imgContents.push({
                    type: 'element',
                    name: 'img',
                    attributes: {
                        src: imgs[i]
                    }
                });
                imgContents.push({
                    type: 'element',
                    name: 'br'
                });
            }
            if (authorComment)
                imgContents.push({
                    type: 'element',
                    name: 'p',
                    elements: [{
                        type: 'text',
                        text: authorComment
                    }]
                });
            atom.addItem({
                title: episode.title,
                summary: authorComment ? authorComment : `[${episode.episodeNo}] ${episode.title}`,
                link: episode.url,
                id: episode.url,
                updated: episode.uploadDate.toISOString(),
                content: imgContents
            })
        }
        return atom.generate()
    }
}

module.exports = WebtoonFeed;