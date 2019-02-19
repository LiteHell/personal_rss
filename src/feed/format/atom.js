const xmljs = require('xml-js'),
      escapeHtml = require('html-escape'),
      escapeXml = require('xml-escape');

class Atom {
    constructor(info) {
        this._xmlObj = {
            _declartion: {
                _attributes: {
                    version: "1.0",
                    encoding: "UTF-8"
                }
            },
            elements: [{
                type: 'element',
                name: 'feed',
                attributes: {
                    'xmlns': 'http://www.w3.org/2005/Atom'
                },
                elements: [
                    // title, subtitle, link(href, rel=self), author := name, id, updated
                    // entry := {title, link(href), id, updated, summary, content(type=html), author := {name, email}}
                ]
            }]
        };
        for (let i in info) {
            let infoTag = {
                type: "element",
                name: i,
                elements: [{
                    type: "text",
                    text: info[i]
                }]
            }
            this._xmlObj.elements[0].elements.push(infoTag)
        }
    }
    setAuthor(name) {
        let authorTag = {
            type: "element",
            name: "author",
            elements: [{
                type: "element",
                name: "name",
                elements: [{
                    type: "text",
                    text: name
                }]
            }]
        }
        this._xmlObj.elements[0].elements.push(authorTag)

    }
    addItem(item) {
        let itemTag = {
            type: "element",
            name: "entry",
            elements: []
        }
        for (let i in item) {
            let itemInfoTag;
            if (i == "link") {
                itemInfoTag = {
                    type: "element",
                    name: "link",
                    attributes: {
                        "href": escapeXml(item.link),
                        "rel": "self"
                    }
                }

            } else if (i == "content") {
                itemInfoTag = {
                    type: "element",
                    name: "content",
                    attributes: {
                        type: 'xhtml'
                    },
                    elements: [{
                        type: "element",
                        name: "div",
                        attributes: {
                            xmlns: 'http://www.w3.org/1999/xhtml'
                        },
                        elements: item.content
                    }]
                }

            } else {
                itemInfoTag = {
                    type: "element",
                    name: i,
                    elements: [{
                        type: "text",
                        text: item[i]
                    }]
                }
            }
            itemTag.elements.push(itemInfoTag);
        }
        this._xmlObj.elements[0].elements.push(itemTag)
    }
    generate() {
        return xmljs.json2xml(this._xmlObj, {
            compact: false
        });
    }
}

module.exports = Atom;