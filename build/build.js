({
  baseUrl: '../lib',
 
  out: '../zig.min.js',
  optimize: 'uglify2',
 
  name: 'almond',
  include: [ 'zig' ],
  wrap: {
    startFile: 'start.frag',
    endFile: 'end.frag'
  },

  paths: {
    'jquery': '../bower_components/jquery/jquery'
  }
})
