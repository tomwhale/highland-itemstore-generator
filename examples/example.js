const streamItemStore = require ( '../index' ) ( {
  storeUrl: 'https://itemstore-stag.inyourarea.co.uk',
  debug: true
} );

streamItemStore ( {
  path: '/items/ids/articles'
} )
  .take ( 5 )
  .collect ()
  .toCallback ( console.log );