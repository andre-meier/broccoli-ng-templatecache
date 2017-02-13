import NgTemplatecache from '../src';
import {Builder} from 'broccoli';
import Funnel from 'broccoli-funnel';
import {existsSync, mkdirSync, rmdirSync, readFileSync} from 'fs';

export default {

  setUp(done) {
    this.inputTrees = [
      new Funnel('test/fixtures', {destDir: '/'}),
      new Funnel('test/fixtures2', {destDir: '/'})
    ];

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
    const tree = new NgTemplatecache(this.inputTrees, {outputFile: 'templates.js'});
    this.builder = new Builder(tree);
    this.builder.build()
      .then(() => {
        const content = readFileSync(this.builder.outputPath + '/templates.js', {encoding: 'utf-8'});
        test.ok(content.includes('two.html'), 'Missing two.html entry');
        test.ok(content.includes('one.html'), 'Missing one.html entry');
        test.ok(content.includes('three.html'), 'Missing three.html entry');
        test.ok(content.includes('nested/deep.html'), 'Missing three.html entry');
      })
      .catch(test.ifError)
      .finally(test.done);
  },

  customModule(test) {
    const tree = new NgTemplatecache(this.inputTrees, {
      outputFile: 'templates.js',
      module: 'superCustom'
    });
    this.builder = new Builder(tree);
    this.builder.build()
      .then(() => {
        const content = readFileSync(this.builder.outputPath + '/templates.js', {encoding: 'utf-8'});
        test.ok(content.includes('superCustom'), 'Missing superCustom module');
      })
      .catch(test.ifError)
      .finally(test.done);
  },

  standalone(test) {
    const tree = new NgTemplatecache(this.inputTrees, {
      outputFile: 'templates.js',
      standalone: true
    });
    this.builder = new Builder(tree);
    this.builder.build()
      .then(() => {
        const content = readFileSync(this.builder.outputPath + '/templates.js', {encoding: 'utf-8'});
        test.ok(content.includes('angular.module("templates", [])'), 'Module was not standalone');
      })
      .catch(test.ifError)
      .finally(test.done);
  },
};
