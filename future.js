function Future( promise ) {
    // Invokes with new if called without
    if (false === (this instanceof Future)) {
        return new Future( promise );
    }

    this.promise = promise;

    return this;
}

Future.prototype.map = function ( processor ) {
    var mapped_promise = new Promise();
    this.promise.onSet( function ( val ) {
        var new_val = processor(val);
        if ( typeof new_val != "undefined" ) {
            if ( typeof new_val == "object" && new_val instanceof Future ) { // there can only be one future
                new_val.map( function ( value ) {
                    mapped_promise.set( value );
                });
            } else {
                mapped_promise.set( new_val );
            }
        }
    });
    return mapped_promise.future();
}

Future.prototype.concat = function ( that_future ) {
    return this.map( function (this_val) {
        return that_future.map( function (that_val) {
            return [this_val, that_val];
        });
    });
};

function Promise( value ) {
    // Invokes with new if called without
    if (false === (this instanceof Promise)) {
        return new Promise( value );
    }

    this.value = value;
}

Promise.prototype.onSet = function ( callback ) {
    if ( typeof this.value != "undefined" ) {
        callback( this.value );
    } else {
        this.on_set = this.on_set || [];
        this.on_set.push(callback);
    }
};

Promise.prototype.set = function ( value ) {
    if ( typeof this.value == "undefined" ) {
        this.value = value;
        (this.on_set || []).forEach( function (cb) { cb(value) } );
    }
};

Promise.prototype.future = function () {
    return new Future( this );
};

module.exports = {
    Future: Future,
    Promise: Promise
};
