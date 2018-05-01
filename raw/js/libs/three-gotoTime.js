THREE.Animation.prototype.gotoTime = function( time ) {

    //clamp to duration of the animation:
    time = THREE.Math.clamp( time, 0, this.length );

    this.currentTime = time;

    // reset key cache
    var h, hl = this.hierarchy.length,
        object;

    for ( h = 0; h < hl; h ++ ) {

        object = this.hierarchy[ h ];

        var prevKey = object.animationCache.prevKey;
        var nextKey = object.animationCache.nextKey;

        prevKey.pos = this.data.hierarchy[ h ].keys[ 0 ];
        prevKey.rot = this.data.hierarchy[ h ].keys[ 0 ];
        prevKey.scl = this.data.hierarchy[ h ].keys[ 0 ];

        nextKey.pos = this.getNextKeyWith( "pos", h, 1 );
        nextKey.rot = this.getNextKeyWith( "rot", h, 1 );
        nextKey.scl = this.getNextKeyWith( "scl", h, 1 );

    }

    //isPlaying must be true for update to work due to "early out"
    //so remember the current play state:
    var wasPlaying = this.isPlaying;
    this.isPlaying = true;

    //update with a delta time of zero:
    this.update( 0 );

    //reset the play state:
    this.isPlaying = wasPlaying;

}
