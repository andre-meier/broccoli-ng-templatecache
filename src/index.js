import CachingWriter from 'broccoli-caching-writer';
import RSVP, {Promise, denodeify} from 'rsvp';
import transform from 'ng-templatecache';
import fs from 'fs';
import path from 'path';
import {map, flatten, compose, concat, flip, zipObj, toPairs, mixin, pick, pluck, createMapEntry} from 'ramda';
import readdirp from 'readdirp';

const readFileAsyncWith = flip(denodeify(fs.readFile));
const readdirAsync = denodeify(fs.readdir);
const writeFileAsync = denodeify(fs.writeFile);
const readdirpAsync = denodeify(readdirp);

const pickOpts = pick(['module', 'standalone']);
const listFiles = compose(readdirpAsync, createMapEntry('root'));
const readFiles = map(readFileAsyncWith({encoding: 'utf-8'}));
function toEntry(kvp) { const [k, v] = kvp; return {path: k, content: v}; }

export default class NgTemplatecache extends CachingWriter {

  updateCache(srcPaths, destDir) {
    const outputPath = path.join(destDir, this.outputFile);
    const dirs = map(listFiles, srcPaths);
    const opts = pickOpts(this);

    return Promise.all(dirs)
      .then(compose(flatten, pluck('files'), flatten))
      .then(function(files) {
        const paths = pluck('path', files);
        const fullPaths = pluck('fullPath', files);
        const contents = readFiles(fullPaths);
        return RSVP.hash(zipObj(paths, contents));
      })
      .then(function(pathsToContents){
        const entries = map(toEntry, toPairs(pathsToContents));
        const body = transform(mixin(opts, {entries: entries}));
        return writeFileAsync(outputPath, body);
      });
  }
}
