import CachingWriter from 'broccoli-caching-writer';
import RSVP, {Promise, denodeify} from 'rsvp';
import transform from 'ng-templatecache';
import fs from 'fs';
import path from 'path';
import {map, flatten, compose, concat, flip, zipObj, toPairs, mixin, pick} from 'ramda';
import glob from 'glob';

const readdirAsync = denodeify(fs.readdir);
const readFileAsyncWith = flip(denodeify(fs.readFile));
const writeFileAsync = denodeify(fs.writeFile);
const globAsync = denodeify(glob);

const joinWith = flip(path.join);
const listFiles = compose(map(globAsync), map(joinWith('**/*')));
function toEntry(kvp) { const [k, v] = kvp; return {path: k, content: v}; }
const pickOpts = pick(['module', 'standalone']);

export default class NgTemplatecache extends CachingWriter {

  updateCache(srcPaths, destDir) {
    const outputPath = path.join(destDir, this.outputFile);
    const dirs = listFiles(srcPaths);
    const opts = pickOpts(this);

    return Promise.all(dirs)
      .then(flatten)
      .then(function(files) {
        const contents = map(readFileAsyncWith({encoding: 'utf-8'}), files);
        return RSVP.hash(zipObj(files, contents));
      })
      .then(function(pathsToContents){
        const entries = map(toEntry, toPairs(pathsToContents));
        const body = transform(mixin(opts, {entries: entries}));
        return writeFileAsync(outputPath, body);
      });

  }
}
