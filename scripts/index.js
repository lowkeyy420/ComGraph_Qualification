import * as THREE from "../three.js/build/three.module.js";
import { OrbitControls } from "../three.js/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../three.js/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();

const defaultCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
defaultCamera.lookAt(0, 0, 0);
defaultCamera.position.set(-7.7, 3.3, 5.4);

const PovCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
PovCamera.lookAt(0, 0, 0);
PovCamera.position.set(0, 3, 1.8);
PovCamera.rotateY(Math.PI);

let currentCamera = defaultCamera;

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new OrbitControls(currentCamera, renderer.domElement);
controls.enablePan = true;
controls.update();

function resizeWindow() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  currentCamera.aspect = window.innerWidth / window.innerHeight;
  currentCamera.updateProjectionMatrix();
}
window.onresize = resizeWindow;

function switchToPOVCamera() {
  currentCamera = PovCamera;
}

function switchToDefaultCamera() {
  window.addEventListener("keydown", (event) => {
    if (event.code == "Space") currentCamera = defaultCamera;
  });
}
switchToDefaultCamera();

function addSkybox() {
  let textureLoader = new THREE.TextureLoader();

  let boxMaterialArr = [
    new THREE.MeshBasicMaterial({
      map: textureLoader.load("../assets/skybox/daylight_box_right.jpg"),
      side: THREE.DoubleSide,
    }),

    new THREE.MeshBasicMaterial({
      map: textureLoader.load("../assets/skybox/daylight_box_left.jpg"),
      side: THREE.DoubleSide,
    }),

    new THREE.MeshBasicMaterial({
      map: textureLoader.load("../assets/skybox/daylight_box_top.jpg"),
      side: THREE.DoubleSide,
    }),

    new THREE.MeshBasicMaterial({
      map: textureLoader.load("../assets/skybox/daylight_box_bottom.jpg"),
      side: THREE.DoubleSide,
    }),

    new THREE.MeshBasicMaterial({
      map: textureLoader.load("../assets/skybox/daylight_box_front.jpg"),
      side: THREE.DoubleSide,
    }),

    new THREE.MeshBasicMaterial({
      map: textureLoader.load("../assets/skybox/daylight_box_back.jpg"),
      side: THREE.DoubleSide,
    }),
  ];

  let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  let skybox = new THREE.Mesh(skyboxGeo, boxMaterialArr);
  scene.add(skybox);
}
addSkybox();

function addAmbientLight() {
  let ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}
addAmbientLight();

let floor;

function addFloor() {
  const geometry = new THREE.PlaneGeometry(100, 100);
  let image = new THREE.TextureLoader().load(
    "../assets/texture-grass-field.jpg"
  );
  image.wrapS = THREE.RepeatWrapping;
  image.wrapT = THREE.RepeatWrapping;
  image.repeat.set(50, 50);

  let texture = new THREE.TextureLoader().load("../assets/nmap.jpeg");

  let material = new THREE.MeshBasicMaterial({
    roughness: 1,
    map: image,
    normalMap: texture,
    side: THREE.DoubleSide,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.receiveShadow = true;
  plane.rotateX(Math.PI / 2);
  scene.add(plane);

  floor = plane;
}
addFloor();

function addObject(object, scale, position, name) {
  let model = object.scene;
  model.scale.set(scale[0], scale[1], scale[2]);
  model.position.set(position[0], position[1], position[2]);
  model.name = name;
  model.castShadow = true;
  model.receiveShadow = true;

  scene.add(model);
}

let loader = new GLTFLoader();
let clock = new THREE.Clock();

//Load Agumon
loader.load(
  "../assets/digimon/scene.gltf",
  (object) => {
    let model = object.scene;

    let animation = object.animations[0];
    let mixer = new THREE.AnimationMixer(model);
    let action = mixer.clipAction(animation);

    action.play();

    function animate() {
      requestAnimationFrame(animate);
      let delta = clock.getDelta();
      mixer.update(delta);
    }

    animate();

    addObject(object, [4, 4, 4], [0, 0.1, 0], "digimon");
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

//Load Clock
loader.load(
  "../assets/clock/scene.gltf",
  (object) => {
    let model = object.scene;
    model.rotateY(5);
    addObject(object, [0.01, 0.01, 0.01], [6, 1.5, 0], "digimon");
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

function addDirectionalLight(x, y, z, color, intensity) {
  let DirectionalLight = new THREE.DirectionalLight(color, intensity);
  DirectionalLight.position.set(x, y, z);
  DirectionalLight.target = floor;
  DirectionalLight.castShadow = true;
  let DirectionalLightHelper = new THREE.DirectionalLightHelper(
    DirectionalLight
  );
  scene.add(DirectionalLight);
  // scene.add(DirectionalLightHelper);
}

addDirectionalLight(0, 2, -4, 0xff0fff, 0.2);
addDirectionalLight(0, -4, 7, 0xffa500, 2);
addDirectionalLight(0, 5, 10, 0xffa500, 0.5);

function render() {
  renderer.render(scene, currentCamera);
  requestAnimationFrame(render);
  console.log(currentCamera.position);
}

render();

function addRaycast() {
  var raycast = new THREE.Raycaster();
  var pointer = new THREE.Vector2();

  window.addEventListener("pointerdown", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycast.setFromCamera(pointer, currentCamera);

    let intersects = raycast.intersectObjects(scene.children);

    intersects.forEach((object) => {
      if (object.object.name === "Object_7") switchToPOVCamera();
    });
  });
}

addRaycast();
