# broccoli-ng-templatecache

Convert Angular templates to $templateCache entries.

## Installation

```
npm install --save broccoli-ng-templatecache
```

## Usage

Pass the constructor a filtered set of trees containing Angular
templates you want combined.

```js
var NgTemplatecache = require('broccoli-ng-templatecache');
var tree = new NgTemplatecache([inputTrees], options);
```

## Options

- `module` (default: `"templates"`) sets the generate module name. `false` means don't create a module
- `standalone` (default: `false`) if `true`, the module will be created as `angular.module('xxx', [])`
