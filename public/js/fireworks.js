let size = 1;
let playing = false;
let effect = false;
let title = document.getElementById('title');
let vr_choice = document.getElementById('vr');
let loading = document.getElementById('loading');
let progress = document.getElementById('progress');
let acceleration = document.getElementById('acceleration');
let song_input = document.getElementById('song_input');
let music_selector = document.getElementById('song');
let current_song = document.getElementById('playing');
let scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 200000 );
let light = new THREE.PointLight(0xffffff, 0.5);
light.position.y = 5000
scene.add( light );
scene.add( new THREE.AmbientLight(0xffffff, 0.5) );
camera.position.z = 0;
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
let stats = new Stats();
document.body.append( stats.dom )
let listener = new THREE.AudioListener();
camera.add( listener );
let sound = new THREE.Audio( listener );
let audioLoader = new THREE.AudioLoader();

//sad.mp3 touch.mp3 Fake.wav woah.mp3

audioLoader.load( 'music/Fake.wav', ( buffer ) => {
	//initial audio load function
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setVolume(1);
  title.style.opacity = 1;
	playing = true;

	server.emit('ready', {
		Velocity: {
			x: 0,
			y: 0,
			z: 0
		},
		Rotation: {
			x: camera.rotation.x,
			y: camera.rotation.y,
			z: camera.rotation.z
		}

	});

  title.remove();

}, ( xhr ) => {
	//load progress function
	let perc = (xhr.loaded / xhr.total * 100);
	let loaded = 'Loading: ' + Math.floor(perc) + '%';
	progress.style.width = ( (perc * 10) / 10 ) + '%';
	loading.innerHTML = loaded;

}, ( err ) => {
	//Error function
	loading.innerHTML = '<span style="color: red;">An error has occured.</span>';

});

function load_song ( file ) {

	let songname = file.name;
	let url = window.URL.createObjectURL( file );

	audioLoader.load( url, ( buffer ) => {
		//initial audio load function
		sound.setBuffer( buffer );
		sound.setLoop(true);
		sound.setVolume(1);
	  title.style.opacity = 1;
		sound.stop();
		sound.play();
		playing = true;
		current_song.innerHTML = songname;

	}, ( xhr ) => {
		//load progress function
		let perc = (xhr.loaded / xhr.total * 100);
		let loaded = 'Loading ' + songname + ': ' + Math.floor(perc) + '%';
		console.log( loaded )
		current_song.innerHTML = loaded;

	}, ( err ) => {
		//Error function

		current_song.innerHTML = 'Failed to load: ' + songname;
		console.log( err )

	});

}

song_input.addEventListener('change', ( e ) => {

	load_song( song_input.files[0] );

})

let the_file;

document.body.addEventListener('drop', ( e ) => {
	e.preventDefault();

	let files = e.target.files || e.dataTransfer.files;

	load_song( files[0] );
});

document.body.addEventListener('dragover', ( e ) => {
	e.preventDefault();
});

document.body.addEventListener('dragend', ( e ) => {
	e.preventDefault();
});

let analyser = new THREE.AudioAnalyser( sound, 128 );

document.body.append( renderer.domElement );

function select_vr( bool ) {

	if( bool ) {
		//VR turned on

		effect = new THREE.StereoEffect( renderer );
		effect.setSize( window.innerWidth, window.innerHeight );
		document.getElementById('crosshairs').remove();

	}

	vr_choice.style.opacity = 1;

	let fade_int = setInterval(() => {
		if ( vr_choice.style.opacity >= 0 ) {
			vr_choice.style.opacity -= 0.05;
		} else {
			vr_choice.remove();
			clearInterval( fade_int );
			sound.play();
		}
	}, 10);

}

function random ( min, max, sign ) {
  let rn = Math.floor((Math.random() * max) + min);
  if ( sign )
    rn *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
  return rn;
};

let first = new LorenzAttractor({
	a: 512,
	b: 3072,
	c: 128,
	t: 0.00005,
	offset: { x: -80, y: 0, z: -100 },
	scale: 1.8,
	colors: [
		{ pct: 0, color: { r: 0x41, g: 0xf4, b: 0xc4 } },
		{ pct: 0.5, color: { r: 0x4e, g: 0x42, b: 0xf4 } },
	  { pct: 1, color: { r: 0xe5, g: 0x42, b: 0xf4 } }
	],
	pointSize: 8,
	analyser: analyser
}, 100000);

let second = new HalvorsenAttractor({
	b: 0.208186,
	t: 1.5,
	scale: 20000,
	offset: {x: 0, y: 3000, z: 500},
	initial: {x: 1000, y: 222, z: 456},
	colors: [
		{ pct: 0, color: { r: 0xf4, g: 0xee, b: 0x42 } },
		{ pct: 0.5, color: { r: 0x41, g: 0xf4, b: 0x68 } },
  	{ pct: 1, color: { r: 0x41, g: 0xdf, b: 0xf4 } }
	],
	pointSize: 50,
	analyser: analyser
}, 100000);

scene.add( first.fractal );
scene.add( second.fractal );

let AudioSpectrum = new AudioBars( analyser, 0.2 );
document.body.appendChild( AudioSpectrum.Dom );

let g = new THREE.CubeGeometry( 100, 100, 100 );
let m = new THREE.MeshNormalMaterial();
let box = new THREE.Mesh( g, m );
box.position.x = 500;
scene.add( box );

let controls = new THREE.SpaceControls( camera, {cb: move} );

camera.rotation.y = 2.4;

function animate () {
	AudioSpectrum.update();
	controls.update();
	first.update();
	second.update();
  TWEEN.update();
	stats.update();
	updatePlayers();
	box.rotation.x += 0.003;
	box.rotation.y += 0.003;
	analyser.getFrequencyData();
	let s = analyser.getAverageFrequency() / 100;
	if ( playing ) { box.scale.set( s, s, s ) };
	if ( !effect ) {
		renderer.render( scene, camera );
	} else {
		effect.render( scene, camera );
	}
  requestAnimationFrame( animate );
};

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();
