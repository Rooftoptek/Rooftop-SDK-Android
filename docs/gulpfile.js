const gulp = require('gulp');
const gutil = require('gulp-util');
const markdownToJSON = require('gulp-markdown-to-json');
const marked = require('marked');
const renderer = new marked.Renderer();

var headerCounter = 0;

renderer.heading = function (text, level) {
  return '<h'  + level + '>' + text + '</h' + level + '>';
},

marked.setOptions({
  gfm: true,
  renderer: renderer
});

var config = {
  flattenIndex: false,
  renderer: marked,
  stripTitle: true,
  name: 'AndroidSDK.json',
  transform: function(data, file) {
    const regex = /<h2[^>]*>([^<]*)<\/h2>/;
    var markup = data.body;
    var indexes = [];
    while (match = regex.exec(markup)) {
      markup = markup.replace(match[0], '').trim();
      indexes.push([match[1], match['index']]);
    }
    data.subsections = [];
    while (index = indexes.pop()) {
      subsection = {
        'title': index[0],
        'data': markup.substr(index[1])
      };
      data.subsections.unshift(subsection);
      markup = markup.substr(0, index[1]).trim();
    };
    delete data.body;
    return data;
  }
}
gulp.task('markdown', () => {
  gulp.src('./*.md')
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(config))
    .pipe(gulp.dest('.'))
});

