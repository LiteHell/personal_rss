const Rss = require('./format/rss'),
      Atom = require('./format/atom'),
      cheerio = require('cheerio');

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

    async atom() {
        // title, subtitle, author := name, id, updated
        // entry := {title, link(href), id, updated, summary, content(type=html), author := {name, email}}

        let webtoonInfo = await this._webtoon.info();
        let episodes = await this._webtoon.parse();
        let webtoonIdHead = 'webtoon-' + webtoonInfo.sitename + '-' + this._webtoon.webtoonId;
        let atom = new Atom({
            title: webtoonInfo.title,
            subtitle: webtoonInfo.description,
            id: webtoonIdHead,
            updated: episodes[0].uploadDate,
        });
        atom.setAuthor(webtoonInfo.author)
        if(episodes.length > 25) episodes = episodes.slice(0, 25);
        for(let episode of episodes) {
            let $ = cheerio.load('<div></div>')
            let imgs = await this._webtoon.getImages(episode);
            for(let i = 0; i < imgs.length; i++) {
                $('div').append(`<img id="img-${i}"></img>`);
                $(`img#img-${i}`).attr('src', imgs[i]);
            }
            atom.addItem({
                title: episode.title,
                summary: `[${episode.episodeNo}] ${episode.title}`,
                link: episode.url,
                id: webtoonIdHead + '-' + episode.id,
                updated: episode.uploadDate,
                content: $.html()
            })
        }
        return atom.generate()
    }
}

module.exports = WebtoonFeed;