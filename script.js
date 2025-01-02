import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Création de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Chargement du modèle 3D
const loader = new GLTFLoader();
loader.load(
  'tour_seul.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
  },
  (xhr) => {
    console.log(`Progression du chargement : ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
  },
  (error) => {
    console.error('Erreur lors du chargement du modèle :', error);
  }
);

// Gestion du redimensionnement
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Variables pour le contrôle de la caméra
const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
};

const moveSpeed = 0.1;
let isPointerLocked = false;
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let mouseSensitivity = 0.002;

// Gestion du Pointer Lock
renderer.domElement.addEventListener('click', () => {
  if (!isPointerLocked) {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
});

// Gestion des touches
window.addEventListener('keydown', (event) => {
  switch(event.code) {
    case 'KeyW':
    case 'KeyZ':
      moveState.forward = true;
      break;
    case 'KeyS':
      moveState.backward = true;
      break;
    case 'KeyA':
    case 'KeyQ':
      moveState.left = true;
      break;
    case 'KeyD':
      moveState.right = true;
      break;
    case 'Space':
      moveState.up = true;
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      moveState.down = true;
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch(event.code) {
    case 'KeyW':
    case 'KeyZ':
      moveState.forward = false;
      break;
    case 'KeyS':
      moveState.backward = false;
      break;
    case 'KeyA':
    case 'KeyQ':
      moveState.left = false;
      break;
    case 'KeyD':
      moveState.right = false;
      break;
    case 'Space':
      moveState.up = false;
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      moveState.down = false;
      break;
  }
});

// Gestion du mouvement de la souris
document.addEventListener('mousemove', (event) => {
  if (isPointerLocked) {
    euler.y -= event.movementX * mouseSensitivity;
    euler.x -= event.movementY * mouseSensitivity;
    
    // Limiter la rotation verticale
    euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x));
    
    // Appliquer la rotation à la caméra
    camera.quaternion.setFromEuler(euler);
  }
});

// Animation
function animate() {
  requestAnimationFrame(animate);

  const direction = new THREE.Vector3(0, 0, 0);
  
  if (moveState.forward) direction.z = -1;
  if (moveState.backward) direction.z = 1;
  if (moveState.left) direction.x = -1;
  if (moveState.right) direction.x = 1;
  if (moveState.up) direction.y = 1;
  if (moveState.down) direction.y = -1;

  if (direction.length() > 0) {
    direction.normalize();
    // N'appliquer la rotation qu'aux mouvements horizontaux
    const rotatedDirection = new THREE.Vector3(direction.x, 0, direction.z);
    rotatedDirection.applyQuaternion(camera.quaternion);
    rotatedDirection.y = direction.y; // Ajouter le mouvement vertical après la rotation
    
    camera.position.addScaledVector(rotatedDirection, moveSpeed);
  }

  renderer.render(scene, camera);
}

animate();