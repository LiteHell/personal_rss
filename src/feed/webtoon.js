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
        if(episodes.length > 25) episodes = episodes.slice(0, 25);
        for(let episode of episodes) {
            rss.addItem({
                title: episode.title,
                description: `[${episode.episodeNo}] ${episode.title}`,
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
        let webtoonIdHead = 'webtoon-' + webtoonInfo.sitename + '-' + this._webtoon.webtoonId;
        let atom = new Atom({
            title: webtoonInfo.title,
            subtitle: webtoonInfo.description,
            id: webtoonInfo.url,
            updated: episodes[0].uploadDate.toISOString(),
        });
        atom.setAuthor(webtoonInfo.author)
        if(episodes.length > 25) episodes = episodes.slice(0, 25);
        for(let episode of episodes) {
            let imgContents = [];
            let imgs = await this._webtoon.getImages(episode);
            for(let i = 0; i < imgs.length; i++) {
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
            atom.addItem({
                title: episode.title,
                summary: `[${episode.episodeNo}] ${episode.title}`,
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