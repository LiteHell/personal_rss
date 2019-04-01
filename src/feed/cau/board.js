const Feed = require('feed').Feed;

class CauBoardFeed {
    constructor(parserName, title, description, link) {
        this._parser = new (require('../../parsers/cau/' + parserName));
        this._feedConfig = {
            title,
            description,
            id: link,
            link: link,
            language: "ko-KR",
            //updated: new Date(articles.map(i => i.date).sort().last()),
            generator: "litehell's personalRss",
            feedLinks: {
                atom: `https://rss.litehell.info/cau/${parserName}/atom`,
                rss: `https://rss.litehell.info/cau/${parserName}/rss`
            }
        };
    }

    async createFeed() {
        let articles = await this._parser.getList(), dates = articles.map(i => i.date).sort();
        this._feedConfig.updated = dates[dates.length - 1];
        let feed = new Feed(this._feedConfig);

        for (let i = 0; i < articles.length; i++) {
            let article = articles[i];
            let articleDetail = await this._parser.getArticle(article.url);
            feed.addItem({
                title: article.title,
                id: article.url,
                link: article.url,
                description: articleDetail.content,
                content: articleDetail.content,
                author: [
                    {
                        name: article.author || articleDetail.author || null
                    }
                ],
                date: article.date
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

module.exports = CauBoardFeed;