import * as THREE from "../three.js/build/three.module.js";
import { OrbitControls } from "../three.js/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../three.js/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();

//Camera

const defaultCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

defaultCamera.lookAt(0, 0, 0);
defaultCamera.position.set(
  -3.144522976760432,
  4.559127917368006,
  7.27682767426293
);

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

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function render() {
  renderer.render(scene, currentCamera);
  requestAnimationFrame(render);
  // console.log(currentCamera.position);
}

// Control
var controls = new OrbitControls(currentCamera, renderer.domElement);
controls.enablePan = true;
controls.update();

function switchToPOVCamera() {
  currentCamera = PovCamera;
}

function switchToDefaultCamera() {
  window.addEventListener("keydown", (event) => {
    if (event.code == "Space") currentCamera = defaultCamera;
  });
}

// Resize Window
function resizeWindow() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  currentCamera.aspect = window.innerWidth / window.innerHeight;
  currentCamera.updateProjectionMatrix();
}
window.onresize = resizeWindow;

// Skybox
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

// Lights
function addAmbientLight() {
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
  scene.add(ambientLight);
}

function addDirectionalLight(x, y, z, color, intensity) {
  let DirectionalLight = new THREE.DirectionalLight(color, intensity);
  DirectionalLight.position.set(x, y, z);
  DirectionalLight.target = floor;
  DirectionalLight.castShadow = true;
  scene.add(DirectionalLight);
  // let DirectionalLightHelper = new THREE.DirectionalLightHelper(
  //   DirectionalLight
  // );
  // scene.add(DirectionalLightHelper);
}

function addSpotLight(x, y, z, color, intensity) {
  let spotLight = new THREE.SpotLight(color, intensity);
  spotLight.position.set(x, y, z);
  spotLight.target = floor;
  spotLight.castShadow = true;
  scene.add(spotLight);
  // let spotLighttHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLighttHelper);
}

// Floor
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

  let material = new THREE.MeshPhongMaterial({
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

// Object 3D Model
let loader = new GLTFLoader();
let clock = new THREE.Clock();
function addObject(object, scale, position, name) {
  let model = object.scene;
  model.scale.set(scale[0], scale[1], scale[2]);
  model.position.set(position[0], position[1], position[2]);
  model.name = name;
  model.castShadow = true;
  model.receiveShadow = true;

  scene.add(model);
}
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
    addObject(object, [0.01, 0.01, 0.01], [6, 1.5, 0], "clock");
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

// Geometry

function addCone(position, wide, height, color) {
  let geometry = new THREE.ConeGeometry(wide, height, 64, 1, true);
  let material = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
  });
  let cone = new THREE.Mesh(geometry, material);
  cone.castShadow = true;
  cone.position.set(position[0], position[1], position[2]);

  scene.add(cone);
}

function addSphere(position, color) {
  let sphereGeo = new THREE.SphereGeometry(0.5, 64, 64);
  let sphereMaterial = new THREE.MeshNormalMaterial({ color: color });
  let sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
  sphere.position.set(position[0], position[1], position[2]);
  sphere.castShadow = true;
  scene.add(sphere);
}

function addCylinder(position, color) {
  let geometry = new THREE.CylinderGeometry(1, 2, 1);
  let material = new THREE.MeshBasicMaterial({
    color: color,
  });
  let cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.set(position[0], position[1], position[2]);
  scene.add(cylinder);
}

// Raycast
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

switchToDefaultCamera();
addSkybox();
addAmbientLight();
addFloor();

addSpotLight(0, 6, -3, 0xff0fff, 0.1);
addSpotLight(0, -1, 7, 0xffa500, 2.4);

addCone([0, 1.3, 14], 1.5, 2.5, 0x8b0000);
addCone([5, 1.3, 14], 1.5, 2.5, 0x8b0000);
addCone([-5, 1.3, 14], 1.5, 2.5, 0x8b0000);

addSphere([0, 0.8, 8], "red");
addCylinder([0, 0.4, 8], "#8b4f39");

render();

addRaycast();
