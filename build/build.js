({
  baseUrl: '../src',

  out: '../zig.min.js',
  optimize: 'uglify2',
 
  name: 'almond',
  include: [ 'zig' ],
  wrap: {
    startFile: 'start.frag',
    endFile: 'end.frag'
  },
  preserveLicenseComments: false,

  paths: {
    'jquery': '../bower_components/jquery/jquery'
  }
})
