let metalsmith = require('metalsmith')
let layouts = require('metalsmith-layouts')

let nunjucks = require('nunjucks')

let siteBuild = metalsmith(__dirname)
    .clean(true)
    .source('./src')
    .metadata({
        site: {
            title: 'Metis Web: Population genetics on the web',
            url: 'https://web.tiago.org',
	    author: 'Tiago Antao'
        }
    })
    .use(layouts({
        engine: 'nunjucks',
        default: 'base.html',
        partials: 'partials',
    }))
    .destination('out')
    .build(function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Site build complete!');
        }
    });