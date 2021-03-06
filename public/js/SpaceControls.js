'use strict';

THREE.SpaceControls = function ( camera, options ) {

  //Set the initial velocity and x, y, z intervals

  let upint,
    downint,
	  leftint,
	  rightint,
    forwardint,
    backint,
    endTime,
    locked,
    full_rotation = Math.PI * 2,
    mouse_prev = { x: 0, y: 0 };

  this.reverse = false;

  this.velocity = {
    x: 0,
    y: 0,
    z: 0
  };

  this.camera = camera;
  this.camera.rotation.order = 'XYZ';

  //Set paramaters to class variables and set default values
  //Sensitivity, lookSensitivity, cb, and Acceleration

  let anon_function = () => {

  };

  this.Sensitivity = options.Sensitivity || 0.8;
  this.cb = options.cb || anon_function;
  this.Acceleration = options.Acceleration || 0.001;
  this.maxSpeed = options.maxSpeed || 1;

  this.getTime = () => {
    let now = new Date();
    let now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getMilliseconds());
    return now_utc.getTime();
  };

  this.startTime = this.getTime();

  //Camera rotation algorithm on mouse movement

  renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;

  renderer.domElement.addEventListener('click', () => { renderer.domElement.requestPointerLock() } );

  if ("onpointerlockchange" in document) {

    document.addEventListener('pointerlockchange', lockChangeAlert, false);

  } else if ("onmozpointerlockchange" in document) {

    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

  }

  function lockChangeAlert() {

    if(document.pointerLockElement === renderer.domElement || document.mozPointerLockElement === renderer.domElement) {

      locked = true;

    } else {

      locked = false;

    }

  }

  renderer.domElement.addEventListener('mousemove', ( evnt ) => {

      if ( locked ) {

        let e = window.event ? window.event : evnt;

      	this.camera.rotation.x += ( e.movementY * 0.01 ) * this.Sensitivity;
      	this.camera.rotation.y += ( e.movementX * -0.01 ) * this.Sensitivity;

      }

  });

  this.checkSpeed = ( directionVector ) => {

    let moveon = true;
    let maxNegative = this.maxSpeed * -1;

    if ( ( this.velocity.x + ( directionVector.x * this.Acceleration ) ) > this.maxSpeed ) {
      moveon = false;
    } else if ( ( this.velocity.y + ( directionVector.y * this.Acceleration ) ) > this.maxSpeed ) {
      moveon = false;
    } else if ( ( this.velocity.z + ( directionVector.z * this.Acceleration ) ) > this.maxSpeed ) {
      moveon = false;
    } else if ( ( this.velocity.x - ( directionVector.x * this.Acceleration ) ) < maxNegative ) {
      moveon = false
    } else if ( ( this.velocity.y - ( directionVector.y * this.Acceleration ) ) < maxNegative ) {
      moveon = false
    } else if ( ( this.velocity.x - ( directionVector.z * this.Acceleration ) ) < maxNegative ) {
      moveon = false;
    }

    return true;

  }

  this.checkSpeedArray = ( directionVectorArray ) => {

    let moveon = true;
    let maxNegative = this.maxSpeed * -1;

    if ( ( this.velocity.x + ( directionVectorArray[0] * this.Acceleration ) ) > this.maxSpeed ) {

      this.velocity.x = this.maxSpeed;
      moveon = false;

    } else if ( ( this.velocity.y + ( directionVectorArray[1] * this.Acceleration ) ) > this.maxSpeed ) {

      this.velocity.y = this.maxSpeed;
      moveon = false;

    } else if ( ( this.velocity.z + ( directionVectorArray[2] * this.Acceleration ) ) > this.maxSpeed ) {

      this.velocity.z = this.maxSpeed;
      moveon = false;

    } else if ( ( this.velocity.x - ( directionVectorArray[0] * this.Acceleration ) ) < maxNegative ) {

      this.velocity.x = maxNegative;
      moveon = false;

    } else if ( ( this.velocity.y - ( directionVectorArray[1] * this.Acceleration ) ) < maxNegative ) {

      this.velocity.y = maxNegative;
      moveon = false;

    } else if ( ( this.velocity.z - ( directionVectorArray[2] * this.Acceleration ) ) < maxNegative ) {

      this.velocity.z = maxNegative;
      moveon = false;

    }

    return true;

  };

  this.updateVelocity = () => {

      let direction = this.camera.getWorldDirection();

      if( this.checkSpeed( direction ) ) {

        this.velocity.x += direction.x * this.Acceleration;
        this.velocity.y += direction.y * this.Acceleration;
        this.velocity.z += direction.z * this.Acceleration;
        this.cb( { Velocity: this.velocity, startTime: this.startTime, position: camera.position, Rotation: camera.rotation });
        this.update();

      }

  };

  this.updateReverseVelocity = () => {
    let direction = this.camera.getWorldDirection();

    if( this.checkSpeed( direction ) ) {

      this.velocity.x -= direction.x * this.Acceleration;
      this.velocity.y -= direction.y * this.Acceleration;
      this.velocity.z -= direction.z * this.Acceleration;
      this.cb( { Velocity: this.velocity, startTime: this.startTime, position: camera.position, Rotation: camera.rotation });
      this.update();

    }

  };

  let vectors = {
    up: new THREE.Vector3( 0, 1, 0 ),
  }

  this.accelerateUp = () => {

    let direction = this.camera.getWorldDirection();
    let rightcross = math.cross( [direction.x, direction.y, direction.z], [0, 1, 0] );
    let upcross = math.cross( rightcross, [direction.x, direction.y, direction.z] );

    if ( this.checkSpeedArray( upcross ) ) {

      this.velocity.x -= upcross[0] * this.Acceleration;
      this.velocity.y -= upcross[1] * this.Acceleration;
      this.velocity.z -= upcross[2] * this.Acceleration;
      this.cb( { Velocity: this.velocity, startTime: this.startTime, position: camera.position, Rotation: camera.rotation });
      this.update();

    }

  }

  this.accelerateDown = () => {

    let direction = this.camera.getWorldDirection();
    let rightcross = math.cross( [direction.x, direction.y, direction.z], [0, 1, 0] );
    let upcross = math.cross( rightcross, [direction.x, direction.y, direction.z] );

    if ( this.checkSpeedArray( upcross ) ) {

      this.velocity.x += upcross[0] * this.Acceleration;
      this.velocity.y += upcross[1] * this.Acceleration;
      this.velocity.z += upcross[2] * this.Acceleration;
      this.cb( { Velocity: this.velocity, startTime: this.startTime, position: camera.position, Rotation: camera.rotation });
      this.update();

    }

  }

  this.accelerateLeft = () => {

    let direction = this.camera.getWorldDirection();
    let rightcross = math.cross( [direction.x, direction.y, direction.z], [0, 1, 0] );

    if ( this.checkSpeedArray( rightcross ) ) {

      this.velocity.x -= rightcross[0] * this.Acceleration;
      this.velocity.y -= rightcross[1] * this.Acceleration;
      this.velocity.z -= rightcross[2] * this.Acceleration;
      this.cb( { Velocity: this.velocity, startTime: this.startTime, position: camera.position, Rotation: camera.rotation });
      this.update();

    }

  }

  this.accelerateRight = () => {

    let direction = this.camera.getWorldDirection();
    let rightcross = math.cross( [direction.x, direction.y, direction.z], [0, 1, 0] );

    if ( this.checkSpeedArray( rightcross ) ) {

      this.velocity.x += rightcross[0] * this.Acceleration;
      this.velocity.y += rightcross[1] * this.Acceleration;
      this.velocity.z += rightcross[2] * this.Acceleration;
      this.cb( { Velocity: this.velocity, startTime: this.startTime, position: camera.position, Rotation: camera.rotation });
      this.update();

    }

  }

  document.addEventListener('keydown', ( e ) => {

  	let evnt = window.event ? window.event : e;

    let negativeMax = this.maxSpeed * -1;

  	if ( evnt.keyCode === 70 ) {
  		//R

  		if ( !upint ) {
        //if the button isn't already being pressed
  			upint = setInterval(() => {

          if ( this.reverse ) {
            this.accelerateDown();
          } else {
            this.accelerateUp();
          }

        }, 10);

  		}

  	}

  	if ( evnt.keyCode === 82 ) {
  		//F
  		if ( !downint ) {

  			downint = setInterval(() => {

          if ( this.reverse ) {
            this.accelerateUp();
          } else {
            this.accelerateDown();
          }

  			}, 10);

  		}
  	}

  	if ( evnt.keyCode === 87 ) {
  		//W
  		if ( !forwardint ) {

  			forwardint = setInterval(() => {

          this.updateVelocity();

  			}, 10);

  		}
  	}

  	if( evnt.keyCode === 83 ) {
  		//S
  		if ( !backint ) {

  			backint = setInterval(() => {

          this.updateReverseVelocity();

  			}, 10);

  		}
  	}

  	if ( evnt.keyCode === 68 ) {
  		//D
  		if ( !rightint ) {

  			rightint = setInterval(() => {

          if ( this.reverse ) {
            this.accelerateLeft();
          } else {
            this.accelerateRight();
          }

  			}, 10);

  		}
  	}

  	if( evnt.keyCode === 65 ) {
  		//A
  		if ( !leftint ) {

  			leftint = setInterval(() => {

          if ( this.reverse ) {
            this.accelerateRight();
          } else {
            this.accelerateLeft();
          }

  			}, 10);

  		}
  	}

  });

  document.addEventListener('keyup', ( e ) => {
  	let evnt = window.event ? window.event : e;

  	if ( evnt.keyCode === 70 ) {
  		//R
  		clearInterval( upint );
  		upint = false;

  	}

  	if( evnt.keyCode === 82 ) {
  		//F
  		clearInterval( downint );
  		downint = false;

  	}

  	if ( evnt.keyCode === 87 ) {
  		//W
  		clearInterval( forwardint );
  		forwardint = false;

  	}

  	if( evnt.keyCode === 83 ) {
  		//S
  		clearInterval( backint );
  		backint = false;

  	}

  	if( evnt.keyCode === 65 ) {
  		//A
  		clearInterval( leftint );
  		leftint = false;

  	}

  	if( evnt.keyCode === 68 ) {
  		//D
  		clearInterval( rightint );
  		rightint = false;

  	}

  });

  this.update = () => {

    let timeDifference = this.getTime() - this.startTime;
    camera.position.x += timeDifference * this.velocity.x;
    camera.position.y += timeDifference * this.velocity.y;
    camera.position.z += timeDifference * this.velocity.z;
    this.startTime = this.getTime();

  }

};
