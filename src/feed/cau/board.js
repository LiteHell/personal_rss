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

    attachmentsHTML(files) {
        if (files.length == 0) return '';
        return `<div class="files" style="border: 1px solid black; padding: 5px;">
        <details>
        <sumaary>첨부파일 (${files.length}개)</summary>
        <ul>
        ${files.map(i => `<a href="${encodeURIComponent(i.url)}" download>${i.name}</a>`)}
        </ul>
        </details>
        </div>`
    }

    async createFeed() {
        let articles = await this._parser.getList(), dates = articles.map(i => i.date).sort();
        this._feedConfig.updated = dates[dates.length - 1];
        let feed = new Feed(this._feedConfig);

        for (let i = 0; i < articles.length; i++) {
            let article = articles[i];
            let articleDetail = await this._parser.getArticle(article.url);
            let content = articleDetail.content +  this.attachmentsHTML(articleDetail.files)
            feed.addItem({
                title: article.title,
                id: article.url,
                link: article.url,
                description: content,
                content: content,
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