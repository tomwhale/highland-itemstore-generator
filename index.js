
const H = require ( 'highland' );
const R = require ( 'ramda' );
const request = require ( 'request' );
const parseResponse = require ( 'highland-parse-response' );

const itemStoreGenerator = ( { storeUrl, debugTrue = false } ) => {
  const queryUrl = options => {
    if ( debugTrue ) {
      console.log ( [ options.method, [ options.url || options.uri, R.map ( R.join ( '=' ), R.toPairs ( options.qs || {} ) ).join ( '&' ) ].join ( '?' ) ].join ( '' ) );
    }
    return H.wrapCallback ( request ) ( options )
      .flatMap ( parseResponse );
  };

  const queryStore = ( { path, method, qs = {}, json, body, timeout, headers } ) => {
    const opts = {
      url: [ storeUrl, path ].join ( '' ),
      method: method || 'GET',
      qs: qs || {},
      json: json === false ? false : json || true,
      body,
      timeout: timeout || 15000,
      headers
    };

    return queryUrl ( opts );
  };

  const streamStore = options => {
    const generator = ( before, pIds, opts ) => {
      const prevIds = pIds || [];
      const queryOptions = opts || options;

      return H ( ( push, next ) => {
        return queryStore ( before ? R.assocPath ( [ 'qs', 'before' ], before, queryOptions ) : queryOptions )
          .errors ( ( error ) => {
            return push ( error );
          } )
          .each ( items => {
            const allItemsUpdatedAtTheSameTime = items.length > 1 && R.length ( R.uniq ( R.map ( R.prop ( 'lastModifiedTime' ), items ) ) ) === 1;

            const uniqItems = R.uniqWith ( item => R.contains ( item.id, prevIds ) ) ( items );

            uniqItems.forEach ( item => {
              push ( null, item );
            } );

            if ( items.length && items.length === queryOptions.qs.count ) {
              return setTimeout ( () => {
                next ( generator (
                  R.last ( items ).lastModifiedTime,
                  R.concat ( prevIds, R.map ( R.prop ( 'id' ), items ) ),
                  allItemsUpdatedAtTheSameTime ?
                    R.assocPath ( [ 'qs', 'count' ], Math.min ( ( queryOptions.qs.count || 100 ) * 2, 1000 ), queryOptions ) :
                    undefined
                ) );
              }, 0 );
            }

            return push ( null, H.nil );
          } );
      } ).reject ( R.isNil );
    };

    return generator ();
  };

  return streamStore;
};

module.exports = ( options ) => {
  return itemStoreGenerator ( options );
};