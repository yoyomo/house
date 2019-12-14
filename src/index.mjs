//@flow
import {BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer} from 'three';

const initialState = {
  camera: null,
  scene: null,
  renderer: null,
  geometry: null,
  material: null,
  mesh: null,
};
/*::
type State = typeof initialState
 */

const init = state => {

  state.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  state.camera.position.z = 1;

  state.scene = new Scene();

  state.geometry = new BoxGeometry(0.2, 0.2, 0.2);
  state.material = new MeshNormalMaterial();

  state.mesh = new Mesh(state.geometry, state.material);
  state.scene.add(state.mesh);

  state.renderer = new WebGLRenderer({antialias: true});
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  if (document.body && state.renderer) {
    document.body.appendChild(state.renderer.domElement);
  }

  return state;
};

const animate = (state, time) => {
  time *= 0.001;

  if(state.mesh){
    state.mesh.rotation.x = time;
    state.mesh.rotation.y = time;
  }

  state.renderer && state.renderer.render(state.scene, state.camera);

  requestAnimationFrame((time) => animate(state, time));

};

const start = state => {
  state = init(state);
  requestAnimationFrame((time) => animate(state, time));
};

start(initialState);