Package.describe({
  name: 'jkhong:momutils',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Provides utils for the mom project',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/j-khong/momutils.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: null
  //documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.5');
  api.use('ecmascript');
  api.mainModule('momutils.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('jkhong:momutils');
  api.mainModule('momutils-tests.js');
});

Npm.depends({
  "@jkhong/devutils": "1.0.0"
});