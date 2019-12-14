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

  if (state.scene) {
    state.scene.rotation.x += e.movementY * 0.01;
    state.scene.rotation.y += e.movementX * 0.01;
  }
}

let zoomEventHandler;
let mouseDownEventHandler;
let mouseMoveEventHandler;

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

const animate = (state, time) => {
  time *= 0.001;

  
  // window.removeEventListener('wheel', zoomEventHandler, { passive: false, capture: true});
  zoomEventHandler = handleZoom(state);
  window.addEventListener('wheel', zoomEventHandler, { passive: false, capture: true});

  window.removeEventListener('mousedown', mouseDownEventHandler, { passive: false});
  mouseDownEventHandler = handleMouse(state)
  window.addEventListener('mousedown', mouseDownEventHandler, { passive: false});

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

const SCALE = 0.1;


const createCenter = (position, size) => {

  for (let param in size) {
    size[param] *= SCALE;
  }

  for (let param in position) {
    position[param] *= SCALE;
  }

  const geometry = new BoxGeometry(size.w, size.h, size.d);
  const material = new MeshNormalMaterial();

  const plane = new Mesh(geometry, material);

  plane.position.x = position.x;
  plane.position.y = position.y;
  plane.position.z = position.z;

  return plane
}

const createPlaneInCentimeters = (position, size) => {

  for (let param in size) {
    size[param] *= SCALE;
  }

  for (let param in position) {
    position[param] *= SCALE;
  }

  const geometry = new BoxGeometry(size.w, size.h, size.d);
  const material = new MeshNormalMaterial();

  const plane = new Mesh(geometry, material);

  plane.position.x = position.x + size.w / 2;
  plane.position.y = position.y + size.h / 2;
  plane.position.z = -1 * (position.z + size.d / 2);

  return plane
}

const createPlaneRelativeTo = (relative, position, size) => {

  const plane = createPlaneInCentimeters(position, size);
  for (let pos in position) {
    plane.position[pos] = relative.position[pos] + position[pos];
  }

  return plane;
}

const initializeRoom = state => {
  const allCubes = [];


  const center = createCenter({ x: 0, y: 0, z: 0 }, { w: 0.02, h: 0.02, d: 0.02 });
  const floor = createPlaneInCentimeters({ x: 0, y: 0, z: 0 }, { w: 3.04, h: 0.02, d: 3.54 });
  const bedWall = createPlaneInCentimeters({ x: 0, y: 0, z: floor.geometry.parameters.depth / SCALE}, { w: 3.04, h: 1.91 + 0.46, d: 0.02 })

  allCubes.push(center);
  allCubes.push(floor);
  allCubes.push(bedWall);

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