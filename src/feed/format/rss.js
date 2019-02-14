const xmljs = require('xml-js');

class rss {
    constructor(info) {
        this._xmlObj = {
            _declartion: {
                _attributes: {
                    version: "1.0",
                    encoding: "UTF-8"
                }
            },
            elements: [
                {
                    type: "element",
                    name: "rss",
                    attributes: {
                        version: "2.0"
                    },
                    elements: []
                }
                // channel -> title, description, link, lastBuildDate, pubDate, ttl
                // [items := {title, description, link, guid(isPermaLink), pubDate}]
            ]
        };
        let channelTag = {
            type: "element",
            name: "channel",
            elements: []
        }
        for(let i in info) {
            let infoTag = {
                type: "element",
                name: i,
                elements: [
                    {
                        type: "text",
                        text: info[i]
                    }
                ]
            }
            channelTag.elements.push(infoTag);
        }
        this._xmlObj.elements[0].elements.push(channelTag)
    }
    addItem(item) {
        let itemTag = {
            type: "element",
            name: "item",
            elements: []
        }
        for(let i in item) {
            let itemInfoTag = {
                type: "element",
                name: i,
                elements: [
                    {
                        type: "text",
                        text: item[i]
                    }
                ]
            }
            itemTag.elements.push(itemInfoTag);
        }
        this._xmlObj.elements[0].elements[0].elements.push(itemTag)
    }
    setChannelImage(imgurl, imgalt, url) {
        let channelImgTag = {
            type: "element",
            name: "image",
            elements: [
                {
                    type: "element",
                    name: "url",
                    elements: [
                        {
                            type: "text",
                            text: imgurl
                        }
                    ]
                },
                {
                    type: "element",
                    name: "title",
                    elements: [
                        {
                            type: "text",
                            text: imgalt
                        }
                    ]
                },
                {
                    type: "element",
                    name: "link",
                    elements: [
                        {
                            type: "text",
                            text: url
                        }
                    ]
                }
            ]
        }
        this._xmlObj.elements[0].elements[0].elements.push(channelImgTag);
    }
    generate() {
        return xmljs.json2xml(this._xmlObj, {compact: false});
    }
}
module.exports = rss;

/*
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
 <title>RSS Title</title>
 <description>This is an example of an RSS feed</description>
 <link>http://www.example.com/main.html</link>
 <lastBuildDate>Mon, 06 Sep 2010 00:01:00 +0000 </lastBuildDate>
 <pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>
 <ttl>1800</ttl>

 <item>
  <title>Example entry</title>
  <description>Here is some text containing an interesting description.</description>
  <link>http://www.example.com/blog/post/1</link>
  <guid isPermaLink="false">7bd204c6-1655-4c27-aeee-53f933c5395f</guid>
  <pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>
 </item>

</channel>
</rss>
*/