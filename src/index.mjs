//@flow
import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

const getInitialState = () => {
  return {
    camera: null,
    scene: null,
    renderer: null
  }
};

const handleZoom = state => e => {
  e.preventDefault();
  if(state.camera){
    state.camera.position.z += e.deltaY * 0.000001;
  } 
}

const handleRotation = state => e => {
  // e.preventDefault();

  const inverted = true;

  const DELTA = 0.01;

  const delta = inverted ? -DELTA : DELTA;

  if (state.scene) {
    state.scene.rotation.x += e.movementY * delta;
    state.scene.rotation.y += e.movementX * delta;
  }

  // state.camera.rotation.x += e.movementY * delta;
  // state.camera.rotation.y += e.movementX * delta;
}

let zoomEventHandler;
let mouseDownEventHandler;
let mouseMoveEventHandler;
let keyPressEventHandler;


const handleMouse = state => e => {
  // e.preventDefault();

  const mouseUpEventHandler = e => {
    window.removeEventListener('mousemove', mouseMoveEventHandler, { passive: false});
    window.removeEventListener('mousedown', mouseDownEventHandler, { passive: false});
  }

  window.removeEventListener('mousemove', mouseMoveEventHandler, { passive: false});
  mouseMoveEventHandler = handleRotation(state)
  window.addEventListener('mousemove', mouseMoveEventHandler, { passive: false});

  window.removeEventListener('mouseup', mouseUpEventHandler, { passive: false});
  window.addEventListener('mouseup', mouseUpEventHandler, { passive: false});


}

const handleKeyPress = state => e => {
  const vel = 0.001;
  if(e.key === 'w'){
    state.camera.position.z -= vel;
  } else if(e.key === 's'){
    state.camera.position.z += vel;
  } else if(e.key === 'a'){
    state.camera.position.x -= vel;
  } else if(e.key === 'd'){
    state.camera.position.x += vel;
  }
}

const animate = (state, time) => {
  time *= 0.001;

  
  // window.removeEventListener('wheel', zoomEventHandler, { passive: false, capture: true});
  zoomEventHandler = handleZoom(state);
  window.addEventListener('wheel', zoomEventHandler, { passive: false, capture: true});

  window.removeEventListener('mousedown', mouseDownEventHandler, { passive: false});
  mouseDownEventHandler = handleMouse(state)
  window.addEventListener('mousedown', mouseDownEventHandler, { passive: false});

  keyPressEventHandler = handleKeyPress(state);
  window.addEventListener('keypress', keyPressEventHandler, { passive: false, capture: true});



  if (state.scene) {
    // state.scene.rotation.x = time;
    // state.scene.rotation.y = time;
  }

  state.renderer && state.renderer.render(state.scene, state.camera);

  requestAnimationFrame((time) => animate(state, time));

};

/*::
type Size = {
  w: number,
  h: number,
  d: number
}

type Position = {
  x: number,
  y: number,
  z: number
}
*/

const createCenter = (position, size) => {

  const geometry = new BoxGeometry(size.w, size.h, size.d);
  const material = new MeshNormalMaterial();

  const plane = new Mesh(geometry, material);

  plane.position.x = position.x;
  plane.position.y = position.y;
  plane.position.z = position.z;

  return plane
}

const createPlaneInCentimeters = (position, size) => {

  const geometry = new BoxGeometry(size.w, size.h, size.d);
  const material = new MeshNormalMaterial();

  const plane = new Mesh(geometry, material);

  plane.position.x = position.x + size.w / 2;
  plane.position.y = position.y + size.h / 2;
  plane.position.z = -1 * (position.z + size.d / 2);

  return plane
}

const initializeRoom = state => {
  const allCubes = [];


  const center = createCenter({ x: 0, y: 0, z: 0 }, { w: 0.02, h: 0.02, d: 0.02 });

  const bedFloor = createPlaneInCentimeters({ x: 0, y: 0, z: 0 }, { w: 3.04, h: 0.02, d: 3.54 });

  const bedDoor = [
  createPlaneInCentimeters({ x: 0, y: 0, z: bedFloor.geometry.parameters.depth}, { w: 0.015, h: 1.91, d: 0.03 })
  , createPlaneInCentimeters({ x: 0.015 + 0.72, y: 0, z: bedFloor.geometry.parameters.depth}, { w: 0.015, h: 1.91, d: 0.03 })
  , createPlaneInCentimeters({ x: 0, y: 1.91, z: bedFloor.geometry.parameters.depth}, { w: 0.75, h: 0.46, d: 0.03 })
  ];

  const bedWall = [
  ...bedDoor
  , createPlaneInCentimeters({ x: 0.75, y: 0, z: bedFloor.geometry.parameters.depth}, { w: 3.04 - 0.75, h: 1.91 + 0.46, d: 0.02 })
  ];



  allCubes.push(center);
  allCubes.push(bedFloor);
  allCubes.push(...bedWall);

  return allCubes;
};

const start = () => {

  const state = getInitialState();

  const fov = 70;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.005;
  const far = 10;

  state.camera = new PerspectiveCamera(fov, aspect, near, far);
    state.camera.position.z = 1;

  // state.camera.position.z = -1;
  state.camera.position.y = 1.75;
  state.camera.position.x = 1;

  const allCubes = initializeRoom(state);

  state.scene = new Scene();

  allCubes.map(cube => {
    if (!state.scene) return
      state.scene.add(cube)
  })

  state.renderer = new WebGLRenderer({ antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);

  if (document.body && state.renderer) {
    document.body.appendChild(state.renderer.domElement);
  }

  requestAnimationFrame((time) => animate(state, time));
};

start();