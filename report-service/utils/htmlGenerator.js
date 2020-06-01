const Handlebars = require('handlebars');

const generate = (obj) => {
    const template = Handlebars.compile(require('../reportHTMLString'));
    const html = template(obj);
    return html;
}

module.exports = {
    generate
}