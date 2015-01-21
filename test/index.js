import NgTemplatecache from '../src';
import {Builder} from 'broccoli';
import pickFiles from 'broccoli-static-compiler';
import {existsSync, mkdirSync, rmdirSync, readFileSync} from 'fs';

export default {

  setUp(done) {
    if (!existsSync('tmp')) {
      mkdirSync('tmp');
    }
    done();
  },

  tearDown(done) {
    if (this.builder) {
      this.builder.cleanup();
    }
    done();
  },

  defaultOpts(test) {
    const tree = new NgTemplatecache(['test/fixtures', 'test/fixtures2'], {outputFile: 'templates.js'});
    this.builder = new Builder(tree);
    this.builder.build()
      .then(function(results) {
        const content = readFileSync(results.directory + '/templates.js', {encoding: 'utf-8'});
        test.ok(content.includes('fixtures/two.html'), 'Missing two.html entry');
        test.ok(content.includes('fixtures/one.html'), 'Missing one.html entry');
        test.ok(content.includes('fixtures2/three.html'), 'Missing three.html entry');
      })
      .catch(test.ifError)
      .finally(test.done);
  },

  customModule(test) {
    const tree = new NgTemplatecache(['test/fixtures', 'test/fixtures2'], {
      outputFile: 'templates.js',
      module: 'superCustom'
    });
    this.builder = new Builder(tree);
    this.builder.build()
      .then(function(results) {
        const content = readFileSync(results.directory + '/templates.js', {encoding: 'utf-8'});
        test.ok(content.includes('superCustom'), 'Missing superCustom module');
      })
      .catch(test.ifError)
      .finally(test.done);
  },

  standalone(test) {
    const tree = new NgTemplatecache(['test/fixtures', 'test/fixtures2'], {
      outputFile: 'templates.js',
      standalone: true
    });
    this.builder = new Builder(tree);
    this.builder.build()
      .then(function(results) {
        const content = readFileSync(results.directory + '/templates.js', {encoding: 'utf-8'});
        test.ok(content.includes('angular.module("templates", [])'), 'Module was not standalone');
      })
      .catch(test.ifError)
      .finally(test.done);
  },


};
