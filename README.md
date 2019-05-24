# highland-itemstore-generator

`npm i highland-itemstore-generator`

## Example ##

```
const streamItemStore = require ( 'highland-itemstore-generator' ) ( {
  storeUrl: 'https://itemstore-stag.inyourarea.co.uk',
  debug: true
} );

streamItemStore ( {
  path: '/items/ids/articles'
} )
  .take ( 5 )
  .collect ()
  .toCallback ( console.log );
```
