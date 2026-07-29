import * as THREE from "three";
import "./style.css";

const app = document.querySelector("#app");
const guideList = document.querySelector("#guideList");
const guideCount = document.querySelector("#guideCount");
const objective = document.querySelector("#objective");
const sightingHint = document.querySelector("#sightingHint");
const catchPrompt = document.querySelector("#catchPrompt");
const catchPromptText = document.querySelector("#catchPromptText");
const catchButton = document.querySelector("#catchButton");
const startButton = document.querySelector("#startButton");
const message = document.querySelector("#message");
const orbCount = document.querySelector("#orbCount");
const orbBag = document.querySelector("#orbBag");
const orbWarning = document.querySelector("#orbWarning");
const cityViewButton = document.querySelector("#cityViewButton");
const brissydex = document.querySelector("#brissydex");
const brissydexButton = document.querySelector("#brissydexButton");
const brissydexClose = document.querySelector("#brissydexClose");
const dexDetail = document.querySelector("#dexDetail");
const dexPopout = document.querySelector("#dexPopout");
const dexPopoutClose = document.querySelector("#dexPopoutClose");
const dexPopoutIcon = document.querySelector("#dexPopoutIcon");
const dexPopoutSpecies = document.querySelector("#dexPopoutSpecies");
const dexPopoutName = document.querySelector("#dexPopoutName");
const dexPopoutFound = document.querySelector("#dexPopoutFound");
const dexPopoutInfo = document.querySelector("#dexPopoutInfo");
const dexPopoutFact = document.querySelector("#dexPopoutFact");
const musicButton = document.querySelector("#musicButton");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9edbed, 34, 88);

const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 160);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.prepend(renderer.domElement);

const clock = new THREE.Clock();
const player = new THREE.Vector3(0, 0, 16);
const playerDirection = new THREE.Vector3();
const keys = new Set();
let yaw = Math.PI;
let pitch = -0.2;
let activeCreature = null;
let pointerLocked = false;
let showMessageTimer;
let remainingOrbs = 20;
let cityView = false;
let playerMoving = false;
let selectedCreatureId = null;
const thrownOrbs = [];
const cityCameraPosition = new THREE.Vector3(42, 30, 48);
const cityCameraTarget = new THREE.Vector3(1, 3.5, -14);
const playerRadius = 0.68;
const collisionShapes = [];
let creatureObjects = [];
const waterRipples = [];
let musicContext;
let musicTimer;
let musicEnabled = false;

const creatures = [
  { id: "ibis", name: "Bin Chicken", subtitle: "Australian white ibis", color: 0xf7f3df, accent: 0x1d2525, pos: [-14, 0, 5], habitat: "near the picnic lawn" },
  { id: "turkey", name: "Backyard Bulldozer", subtitle: "Australian brush-turkey", color: 0x252018, accent: 0xdd5d3c, pos: [14, 0, -7], habitat: "under the gum trees" },
  { id: "cockatoo", name: "Sunshine Screamer", subtitle: "Sulphur-crested cockatoo", color: 0xffffff, accent: 0xf6cd3b, pos: [-11, 0, -17], habitat: "by the lookout" },
  { id: "dragon", name: "River Scout", subtitle: "Eastern water dragon", color: 0x416d4a, accent: 0x7fc37c, pos: [11, 0, 14], habitat: "on the river rocks" },
  { id: "possum", name: "Moonlight Neighbour", subtitle: "Common brushtail possum", color: 0x6c6158, accent: 0xefe0ca, pos: [1, 0, -24], habitat: "near the old fig tree" },
  { id: "lorikeet", kind: "bird", name: "Laneway Rainbow", subtitle: "Rainbow lorikeet", color: 0x2f9a62, accent: 0xf0b132, pos: [-20, 0, -18], habitat: "beside the Wheel of Brisbane" },
  { id: "kookaburra", kind: "bird", name: "River Laugher", subtitle: "Laughing kookaburra", color: 0xa97850, accent: 0xf1e5cb, pos: [-7, 0, -7], habitat: "near the Story Bridge" },
  { id: "pelican", kind: "ibis", name: "River Glider", subtitle: "Australian pelican", color: 0xf2f0e7, accent: 0x222222, pos: [17, 0, -19], habitat: "on the riverfront" },
  { id: "flying-fox", kind: "possum", name: "Twilight Flier", subtitle: "Grey-headed flying fox", color: 0x34302d, accent: 0x9b7660, pos: [8, 0, -29], habitat: "beside Queen's Wharf" },
  { id: "magpie", kind: "bird", name: "Morning Songster", subtitle: "Australian magpie", color: 0x252525, accent: 0xf1f0e7, pos: [-4, 0, 7], habitat: "on the river lawn" },
  { id: "curlew", kind: "ibis", name: "Night Watcher", subtitle: "Bush stone-curlew", color: 0xa88761, accent: 0x372e27, pos: [-26, 0, 1], habitat: "beside the botanic path" },
  { id: "king-parrot", kind: "bird", name: "Garden Royal", subtitle: "Australian king-parrot", color: 0x2b9c51, accent: 0xd64839, pos: [4, 0, -15], habitat: "in the flowering gums" },
  { id: "blue-tongue", kind: "dragon", name: "Blue-Tongue Scout", subtitle: "Eastern blue-tongue lizard", color: 0x6b6654, accent: 0x496fa4, pos: [16, 0, 5], habitat: "near the warm river stones" },
  { id: "currawong", kind: "bird", name: "City Caller", subtitle: "Pied currawong", color: 0x1d2325, accent: 0xffffff, pos: [-12, 0, -26], habitat: "near the Wheel of Brisbane" },
  { id: "plover", kind: "bird", name: "Park Guardian", subtitle: "Masked lapwing", color: 0xddd6b5, accent: 0xe5b929, pos: [12, 0, -13], habitat: "on the open grass" }
];
const creatureIcons = {
  ibis: "🪶", turkey: "🦃", cockatoo: "🦜", dragon: "🦎", possum: "🐾",
  lorikeet: "🦜", kookaburra: "🐦", pelican: "🪶", "flying-fox": "🦇", magpie: "🐦",
  curlew: "🐦", "king-parrot": "🦜", "blue-tongue": "🦎", currawong: "🐦", plover: "🐦"
};
const catches = new Set();
const knowledge = {
  ibis: "Often called a bin chicken, the Australian white ibis uses its long curved bill to probe for food in soft ground and city parks.",
  turkey: "Brush-turkeys build enormous compost mounds. The warmth from decaying leaves incubates their eggs.",
  cockatoo: "Sulphur-crested cockatoos use their powerful beaks to crack seeds, nuts, and even tough branches.",
  dragon: "Eastern water dragons are excellent swimmers and can remain underwater to avoid danger.",
  possum: "Common brushtail possums are nocturnal tree climbers that often make homes around suburban Brisbane.",
  lorikeet: "Rainbow lorikeets have brush-tipped tongues especially adapted for drinking nectar from flowers.",
  kookaburra: "The kookaburra's famous call carries across bushland and parks, especially in the early morning.",
  pelican: "Australian pelicans have one of the longest bills of any bird and use it to scoop fish from the water.",
  "flying-fox": "Grey-headed flying foxes help pollinate native trees as they travel between flowering food sources at night.",
  magpie: "Australian magpies have complex songs and can remember individual people around their territory.",
  curlew: "Bush stone-curlews are mostly active at night and use their stillness and camouflage for protection.",
  "king-parrot": "Male Australian king-parrots are bright red and green; females have mostly green heads and chests.",
  "blue-tongue": "Blue-tongue lizards flash their bright blue tongues as a warning when threatened.",
  currawong: "Pied currawongs are adaptable city birds with a distinctive ringing call and bright yellow eyes.",
  plover: "Masked lapwings defend their nests on open grassland and are well known for their loud alarm calls."
};
const funFacts = {
  ibis: "Its curved bill can reach food in places where a straight bill cannot.",
  turkey: "A single brush-turkey mound can be taller than a person.",
  cockatoo: "Their crest is raised to communicate excitement, alarm, or curiosity.",
  dragon: "They can drop into water and stay submerged when they need a quick escape.",
  possum: "Their prehensile tail acts like an extra hand while climbing.",
  lorikeet: "A rainbow lorikeet's tongue has tiny brush-like bristles for sipping nectar.",
  kookaburra: "A family group's dawn chorus helps mark its territory.",
  pelican: "Its pouch can hold far more water than the pelican's stomach.",
  "flying-fox": "Despite the name, flying foxes are bats and navigate mainly with their eyesight.",
  magpie: "Magpies can recognise human faces for years.",
  curlew: "Their night-time call is so eerie it is sometimes mistaken for a ghost story.",
  "king-parrot": "King-parrots often visit Brisbane gardens for fruit, seeds, and blossoms.",
  "blue-tongue": "The bright tongue is a bluff: it makes a lizard look more dangerous than it is.",
  currawong: "Their yellow eyes are one of the easiest ways to identify them.",
  plover: "Their wing spurs are real: they use them to defend nests on the ground."
};
const spawnSites = [
  new THREE.Vector3(-14, 0, 5), new THREE.Vector3(14, 0, -7), new THREE.Vector3(-11, 0, -17),
  new THREE.Vector3(11, 0, 14), new THREE.Vector3(1, 0, -24), new THREE.Vector3(-20, 0, -18),
  new THREE.Vector3(-7, 0, -7), new THREE.Vector3(17, 0, -19), new THREE.Vector3(8, 0, -29),
  new THREE.Vector3(-26, 0, 1), new THREE.Vector3(4, 0, -15), new THREE.Vector3(16, 0, 5),
  new THREE.Vector3(-35, 0, 37), new THREE.Vector3(-39, 0, -23), new THREE.Vector3(-10, 0, 42),
  new THREE.Vector3(7, 0, 38), new THREE.Vector3(-42, 0, 6)
];
const districts = [
  { name: "Botanic Gardens", position: new THREE.Vector3(-25, 0, 39) },
  { name: "West End Laneway", position: new THREE.Vector3(-36, 0, -23) },
  { name: "South Bank", position: new THREE.Vector3(-22, 0, -27) },
  { name: "Story Bridge Park", position: new THREE.Vector3(2, 0, -8) },
  { name: "Brisbane Riverwalk", position: new THREE.Vector3(10, 0, 16) },
  { name: "Queen's Wharf", position: new THREE.Vector3(6, 0, -31) }
];

function createCatchOrb() {
  const orb = new THREE.Group();
  const teal = new THREE.MeshStandardMaterial({ color: 0x168c83, roughness: 0.34, metalness: 0.18 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.52 });
  const band = new THREE.MeshStandardMaterial({ color: 0x193e43, roughness: 0.42, metalness: 0.2 });
  const lower = mesh(new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), teal, [0, 0, 0]);
  const upper = mesh(new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), cream, [0, 0, 0]);
  const belt = mesh(new THREE.TorusGeometry(0.223, 0.025, 6, 16), band, [0, 0, 0]);
  belt.rotation.x = Math.PI / 2;
  const button = mesh(new THREE.SphereGeometry(0.052, 10, 8), cream, [0, 0, 0.215]);
  orb.add(lower, upper, belt, button);
  return orb;
}

function createTrainerAvatar() {
  const trainer = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xa96f52, roughness: 0.82 });
  const teal = new THREE.MeshStandardMaterial({ color: 0x1f7d75, roughness: 0.62 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf1dfba, roughness: 0.78 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x203d50, roughness: 0.72 });
  const boot = new THREE.MeshStandardMaterial({ color: 0x342c2a, roughness: 0.9 });
  const pack = new THREE.MeshStandardMaterial({ color: 0xd57e42, roughness: 0.68 });
  const torso = mesh(new THREE.CapsuleGeometry(0.34, 0.62, 6, 12), teal, [0, 1.35, 0]);
  const vest = mesh(new THREE.BoxGeometry(0.72, 0.7, 0.2), cream, [0, 1.38, 0.28]);
  const head = mesh(new THREE.SphereGeometry(0.28, 16, 12), skin, [0, 2.16, 0]);
  const cap = mesh(new THREE.SphereGeometry(0.31, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), teal, [0, 2.28, 0]);
  const brim = mesh(new THREE.BoxGeometry(0.3, 0.06, 0.2), teal, [0, 2.24, 0.27]);
  const backpack = mesh(new THREE.BoxGeometry(0.58, 0.68, 0.24), pack, [0, 1.43, -0.32]);
  trainer.add(torso, vest, head, cap, brim, backpack);

  const legs = [];
  for (const side of [-1, 1]) {
    const leg = mesh(new THREE.CapsuleGeometry(0.105, 0.52, 5, 8), navy, [side * 0.19, 0.65, 0]);
    const shoe = mesh(new THREE.BoxGeometry(0.22, 0.13, 0.36), boot, [side * 0.19, 0.17, 0.1]);
    const arm = mesh(new THREE.CapsuleGeometry(0.09, 0.48, 5, 8), skin, [side * 0.46, 1.42, 0.03]);
    arm.rotation.z = side * 0.18;
    trainer.add(leg, shoe, arm);
    legs.push(leg);
    if (side === 1) trainer.userData.throwArm = arm;
  }
  const hand = new THREE.Group();
  hand.position.set(0.48, 1.16, 0.2);
  const handOrb = createCatchOrb();
  handOrb.scale.setScalar(1.15);
  hand.add(handOrb);
  trainer.add(hand);
  const shadow = mesh(new THREE.CircleGeometry(0.56, 24), new THREE.MeshBasicMaterial({ color: 0x173128, transparent: true, opacity: 0.23, depthWrite: false }), [0, 0.012, 0], false);
  shadow.rotation.x = -Math.PI / 2;
  trainer.add(shadow);
  trainer.userData = { hand, handOrb, legs, shadow, throwArm: trainer.userData.throwArm };
  trainer.position.copy(player);
  scene.add(trainer);
  return trainer;
}

const trainer = createTrainerAvatar();

function addLights() {
  scene.add(new THREE.HemisphereLight(0xd9f4ff, 0x54864a, 2.9));
  const sun = new THREE.DirectionalLight(0xfff1bd, 2.75);
  sun.position.set(-25, 52, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -45;
  sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -45;
  scene.add(sun);
}

function mesh(geometry, material, position, castShadow = true) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = castShadow;
  object.receiveShadow = true;
  return object;
}

function addCircleCollider(x, z, radius) {
  collisionShapes.push({ type: "circle", x, z, radius });
}

function addBoxCollider(x, z, halfWidth, halfDepth) {
  collisionShapes.push({ type: "box", x, z, halfWidth, halfDepth });
}

function isBlocked(position, radius = playerRadius) {
  if (position.x < -46 || position.x > 14.5 || position.z < -48 || position.z > 48) return true;
  const hitsScenery = collisionShapes.some((shape) => {
    if (shape.type === "circle") return Math.hypot(position.x - shape.x, position.z - shape.z) < shape.radius + radius;
    return Math.abs(position.x - shape.x) < shape.halfWidth + radius && Math.abs(position.z - shape.z) < shape.halfDepth + radius;
  });
  const hitsCreature = creatureObjects.some((creature) => creature.visible && !creature.userData.caught && Math.hypot(position.x - creature.position.x, position.z - creature.position.z) < 1.15 + radius);
  return hitsScenery || hitsCreature;
}

function movePlayer(move) {
  const next = player.clone().add(move);
  if (!isBlocked(next)) {
    player.copy(next);
    return;
  }
  const xOnly = player.clone().add(new THREE.Vector3(move.x, 0, 0));
  if (!isBlocked(xOnly)) player.copy(xOnly);
  const zOnly = player.clone().add(new THREE.Vector3(0, 0, move.z));
  if (!isBlocked(zOnly)) player.copy(zOnly);
}

function resolveCameraPosition(target, desired) {
  const safePosition = new THREE.Vector3();
  for (let progress = 1; progress >= 0.12; progress -= 0.06) {
    safePosition.lerpVectors(target, desired, progress);
    if (!isBlocked(safePosition, 0.35)) return safePosition.clone();
  }
  const fallbackDirection = desired.clone().sub(target).setY(0).normalize();
  for (let distance = 4.8; distance >= 2.4; distance -= 0.4) {
    safePosition.copy(target).addScaledVector(fallbackDirection, distance);
    safePosition.y = target.y + 1.7;
    if (!isBlocked(safePosition, 0.3)) return safePosition.clone();
  }
  return target.clone().addScaledVector(fallbackDirection, 2.2).add(new THREE.Vector3(0, 1.8, 0));
}

function makeGround() {
  const grass = mesh(new THREE.PlaneGeometry(190, 190), new THREE.MeshStandardMaterial({ color: 0x7eb45c, roughness: 1 }), [-7, -0.04, 0], false);
  grass.rotation.x = -Math.PI / 2;
  scene.add(grass);

  const river = mesh(new THREE.PlaneGeometry(18, 190), new THREE.MeshStandardMaterial({ color: 0x47bed8, roughness: 0.18, metalness: 0.16 }), [25, 0.01, 0], false);
  river.rotation.x = -Math.PI / 2;
  scene.add(river);

  const path = mesh(new THREE.PlaneGeometry(8, 142), new THREE.MeshStandardMaterial({ color: 0xdcc58c, roughness: 0.95 }), [-2, 0.015, -2], false);
  path.rotation.x = -Math.PI / 2;
  path.rotation.z = 0.14;
  scene.add(path);

  const lawnMaterials = [0x91c96d, 0x6fac59, 0x9fd87b].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true, opacity: 0.42 }));
  for (const [x, z, width, depth, material] of [[-32, 18, 20, 14, 0], [-18, -14, 18, 11, 1], [0, 31, 20, 13, 2], [-38, -28, 16, 20, 0], [-13, 44, 23, 12, 1]]) {
    const patch = mesh(new THREE.PlaneGeometry(width, depth), lawnMaterials[material], [x, -0.025, z], false);
    patch.rotation.x = -Math.PI / 2;
    patch.rotation.z = (x + z) * 0.02;
    scene.add(patch);
  }
  for (const x of [15.65, 34.35]) {
    const bank = mesh(new THREE.PlaneGeometry(1.1, 190), new THREE.MeshStandardMaterial({ color: 0xf0d991, roughness: 0.96 }), [x, 0.02, 0], false);
    bank.rotation.x = -Math.PI / 2;
    scene.add(bank);
  }
  const rippleMaterial = new THREE.MeshBasicMaterial({ color: 0xd9f3ec, transparent: true, opacity: 0.28, depthWrite: false });
  for (let index = 0; index < 26; index += 1) {
    const ripple = mesh(new THREE.PlaneGeometry(1.2 + (index % 3) * 0.5, 0.05), rippleMaterial.clone(), [19 + (index % 7) * 2.05, 0.045, -82 + ((index * 17) % 166)], false);
    ripple.rotation.x = -Math.PI / 2;
    waterRipples.push({ mesh: ripple, phase: index * 0.61, baseX: ripple.position.x, baseZ: ripple.position.z });
    scene.add(ripple);
  }
}

function makeBrightDayAtmosphere() {
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 32;
  skyCanvas.height = 512;
  const sky = skyCanvas.getContext("2d");
  const gradient = sky.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#57b7e1");
  gradient.addColorStop(0.5, "#8fd8ef");
  gradient.addColorStop(0.77, "#c3edf4");
  gradient.addColorStop(1, "#d9f2cf");
  sky.fillStyle = gradient;
  sky.fillRect(0, 0, 32, 512);
  scene.background = new THREE.CanvasTexture(skyCanvas);

  const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x75aa72, roughness: 1, flatShading: true });
  const hillShadow = new THREE.MeshStandardMaterial({ color: 0x5b946a, roughness: 1, flatShading: true });
  for (const [x, z, scale, material] of [[-58, -78, 17, hillMaterial], [-28, -86, 22, hillShadow], [8, -82, 18, hillMaterial], [42, -88, 26, hillShadow]]) {
    const hill = mesh(new THREE.DodecahedronGeometry(scale, 1), material, [x, 7, z], false);
    hill.scale.y = 0.46;
    scene.add(hill);
  }

  const sunCanvas = document.createElement("canvas");
  sunCanvas.width = 128;
  sunCanvas.height = 128;
  const sunContext = sunCanvas.getContext("2d");
  const glow = sunContext.createRadialGradient(64, 64, 7, 64, 64, 62);
  glow.addColorStop(0, "rgba(255,255,241,1)");
  glow.addColorStop(0.42, "rgba(255,246,171,.72)");
  glow.addColorStop(1, "rgba(255,245,184,0)");
  sunContext.fillStyle = glow;
  sunContext.fillRect(0, 0, 128, 128);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(sunCanvas), transparent: true, depthWrite: false }));
  sun.position.set(-26, 38, -76);
  sun.scale.set(10, 10, 1);
  scene.add(sun);

  const groundCover = new THREE.MeshStandardMaterial({ color: 0x4e8148, roughness: 1, flatShading: true });
  for (let index = 0; index < 88; index += 1) {
    const x = -43 + ((index * 17) % 54);
    const z = -43 + ((index * 29) % 87);
    if (Math.abs(x + 2) < 5 || (x > 14 && x < 35)) continue;
    const tuft = mesh(new THREE.ConeGeometry(0.16 + (index % 3) * 0.045, 0.55 + (index % 4) * 0.12, 5), groundCover, [x, 0.24, z], false);
    tuft.rotation.y = index * 0.7;
    scene.add(tuft);
  }
}

function updateAtmosphere(time) {
  waterRipples.forEach((ripple) => {
    ripple.mesh.position.x = ripple.baseX + Math.sin(time * 0.0008 + ripple.phase) * 0.28;
    ripple.mesh.material.opacity = 0.18 + Math.sin(time * 0.0014 + ripple.phase) * 0.08;
  });
}

function makeTree(x, z, scale = 1) {
  const trunk = mesh(new THREE.CylinderGeometry(0.38 * scale, 0.58 * scale, 4.3 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x79513a, roughness: 1 }), [x, 2.15 * scale, z]);
  const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x33704a, roughness: 0.95, flatShading: true });
  const crown = mesh(new THREE.DodecahedronGeometry(2.1 * scale, 0), crownMaterial, [x, 5.2 * scale, z]);
  const crown2 = mesh(new THREE.DodecahedronGeometry(1.5 * scale, 0), crownMaterial, [x + 1.15 * scale, 4.8 * scale, z + 0.3 * scale]);
  scene.add(trunk, crown, crown2);
  addCircleCollider(x, z, 0.58 * scale);
}

function makePalm(x, z, scale = 1) {
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x806143, roughness: 0.92 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x2d754d, roughness: 0.88, flatShading: true });
  scene.add(mesh(new THREE.CylinderGeometry(0.18 * scale, 0.31 * scale, 5.2 * scale, 9), trunkMaterial, [x, 2.6 * scale, z]));
  addCircleCollider(x, z, 0.43 * scale);
  for (let leaf = 0; leaf < 7; leaf += 1) {
    const frond = mesh(new THREE.ConeGeometry(0.42 * scale, 2.8 * scale, 5), leafMaterial, [x + Math.cos(leaf) * 0.75 * scale, 5.25 * scale, z + Math.sin(leaf) * 0.75 * scale]);
    frond.rotation.z = Math.cos(leaf) * 1.05;
    frond.rotation.x = Math.sin(leaf) * 1.05;
    scene.add(frond);
  }
}

function makeLandmarks() {
  const trees = [[-23, 9, 1.2], [-19, -11, 1.4], [-3, -22, 1.3], [5, -29, 1.7], [17, -21, 1], [-17, 23, 1.2], [4, 24, 1.1], [17, 6, 1.35], [-31, -3, 1.25], [-28, 15, 1], [-24, 27, 1.5], [-13, 17, 1.1], [-10, 25, 1.4], [-2, 30, 1.1], [8, 19, 1.25], [12, 26, 1.05], [19, 24, 1.3], [-31, -25, 1.1], [-18, -35, 1.25], [22, -29, 1.1]];
  for (const [x, z, scale] of trees) makeTree(x, z, scale);
  for (const [x, z, scale] of [[-29, -16, 1.1], [-24, -21, 0.9], [15, -26, 1.1], [20, -16, 0.95], [18, 14, 1.05], [26, 18, 0.9]]) makePalm(x, z, scale);
  for (let i = 0; i < 16; i += 1) {
    const x = -30 + ((i * 11) % 50);
    const z = -30 + ((i * 17) % 56);
    const rock = mesh(new THREE.DodecahedronGeometry(0.38 + (i % 3) * 0.18, 0), new THREE.MeshStandardMaterial({ color: 0x8a9676, flatShading: true }), [x, 0.25, z]);
    rock.rotation.set(i, i * 0.6, 0);
    scene.add(rock);
  }
  makeWheelOfBrisbane(-22, -27);
  makeStoryBridge(17, -9);
  makeQueensWharf(7, -31);
  makeCitySkyline(-4, -42);
  makeCityBlocks();
  makeDistrictDetails();
}

function makeCityBlocks() {
  const buildingMaterial = [0xd9d0c3, 0xd0c0aa, 0xc5d3cf, 0xd8c5b3].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.72 }));
  const glass = new THREE.MeshStandardMaterial({ color: 0x426c7b, roughness: 0.26, metalness: 0.26 });
  const awning = new THREE.MeshStandardMaterial({ color: 0xc66545, roughness: 0.68 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x4f5b5d, roughness: 0.72 });
  const blocks = [[-43, -33, 4.6, 9], [-39, -21, 3.8, 6], [-33, -33, 4.3, 8], [-27, -39, 5.2, 11], [-18, -41, 4.1, 7], [-13, -34, 3.4, 6], [19, -39, 4.6, 9], [26, -32, 3.7, 6], [-31, 1, 3.4, 5], [-27, 7, 4.1, 7], [-25, 20, 3.6, 6], [-34, 31, 4.1, 6], [7, 31, 4, 6], [14, 31, 3.8, 8], [2, 43, 4.4, 10], [11, 40, 3.8, 7]];
  blocks.forEach(([x, z, width, height], index) => {
    const material = buildingMaterial[index % buildingMaterial.length];
    scene.add(mesh(new THREE.BoxGeometry(width, height, 3.6), material, [x, height / 2, z]));
    scene.add(mesh(new THREE.BoxGeometry(width * 0.72, height * 0.84, 0.08), glass, [x, height / 2, z + 1.85]));
    scene.add(mesh(new THREE.BoxGeometry(width + 0.35, 0.28, 3.95), roof, [x, height + 0.14, z]));
    scene.add(mesh(new THREE.BoxGeometry(width + 0.16, 0.32, 0.6), awning, [x, 1.6, z + 2.02]));
    addBoxCollider(x, z, width / 2, 2.15);
  });
}

function makeDistrictDetails() {
  const timber = new THREE.MeshStandardMaterial({ color: 0x9b7046, roughness: 0.88 });
  const paleTimber = new THREE.MeshStandardMaterial({ color: 0xd8bd80, roughness: 0.82 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xb8baa6, roughness: 0.9 });
  const flowerMaterials = [0xef927d, 0xf1d36a, 0xd888ba].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.82 }));

  // Riverside promenade: a readable route that leads players along the water without entering it.
  const boardwalk = mesh(new THREE.BoxGeometry(3.4, 0.24, 96), paleTimber, [12.25, 0.12, 0]);
  scene.add(boardwalk);
  for (let z = -44; z <= 44; z += 8) {
    for (const side of [-1, 1]) {
      scene.add(mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.05, 7), timber, [12.25 + side * 1.5, 0.66, z]));
      scene.add(beamBetween(new THREE.Vector3(12.25 + side * 1.5, 0.92, z - 3.9), new THREE.Vector3(12.25 + side * 1.5, 0.92, z + 3.9), timber, 0.045));
    }
  }
  makeLabel("Brisbane Riverwalk", 10.5, 2.6, 24);

  // Botanic Gardens: flowering beds, a pavilion, and extra canopy create an explorable northern district.
  for (const [x, z, scale] of [[-41, 37, 1.15], [-33, 43, 1.25], [-25, 38, 1.1], [-18, 45, 1.35], [-12, 35, 1.1]]) makeTree(x, z, scale);
  for (let bed = 0; bed < 4; bed += 1) {
    const x = -31 + (bed % 2) * 5.2;
    const z = 36 + Math.floor(bed / 2) * 5.2;
    scene.add(mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.35, 10), stone, [x, 0.16, z]));
    for (let flower = 0; flower < 7; flower += 1) {
      const angle = (flower / 7) * Math.PI * 2;
      scene.add(mesh(new THREE.SphereGeometry(0.18, 8, 6), flowerMaterials[(flower + bed) % flowerMaterials.length], [x + Math.cos(angle) * 1.15, 0.52, z + Math.sin(angle) * 1.15]));
    }
  }
  const pavilion = new THREE.Group();
  pavilion.add(mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.18, 10), stone, [-21, 0.1, 39]));
  for (const [offsetX, offsetZ] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) pavilion.add(mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.8, 8), paleTimber, [-21 + offsetX, 1.5, 39 + offsetZ]));
  pavilion.add(mesh(new THREE.ConeGeometry(3.3, 1.25, 6), timber, [-21, 3.15, 39]));
  scene.add(pavilion);
  addCircleCollider(-21, 39, 3.1);
  makeLabel("Botanic Gardens", -28, 5.6, 40);

  // Laneway edge: seating, lamps, and compact street stalls give the south-west more city texture.
  for (let index = 0; index < 5; index += 1) {
    const z = -39 + index * 7;
    scene.add(mesh(new THREE.BoxGeometry(2.2, 0.2, 0.72), timber, [-36, 0.78, z]));
    for (const xOffset of [-0.85, 0.85]) scene.add(mesh(new THREE.BoxGeometry(0.16, 0.7, 0.5), timber, [-36 + xOffset, 0.4, z]));
    scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x344449, roughness: 0.55, metalness: 0.35 }), [-31.8, 1.6, z]));
    scene.add(mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffdd87, emissive: 0xffa22e, emissiveIntensity: 1.3 }), [-31.8, 3.25, z]));
  }
  makeLabel("West End Laneway", -36, 3.4, -23);
}

function makeLabel(text, x, y, z) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 108;
  const context = canvas.getContext("2d");
  context.fillStyle = "rgba(20, 55, 42, 0.92)";
  context.roundRect(8, 8, 496, 92, 34);
  context.fill();
  context.fillStyle = "#fff9e8";
  context.font = "700 42px system-ui";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 54);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: false }));
  sprite.position.set(x, y, z);
  sprite.scale.set(7, 1.48, 1);
  scene.add(sprite);
}

function makeWheelOfBrisbane(x, z) {
  const wheel = new THREE.Group();
  const cream = new THREE.MeshStandardMaterial({ color: 0xf5eee1, roughness: 0.5, metalness: 0.35 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe1b34b, roughness: 0.42, metalness: 0.48 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x45545a, roughness: 0.45, metalness: 0.52 });
  const cabin = new THREE.MeshStandardMaterial({ color: 0x82c9d7, roughness: 0.24, metalness: 0.15, transparent: true, opacity: 0.88 });
  const glow = new THREE.MeshStandardMaterial({ color: 0xffe392, emissive: 0xffa11b, emissiveIntensity: 1.6 });
  const centre = new THREE.Vector3(0, 6.5, 0);
  const ring = mesh(new THREE.TorusGeometry(5.2, 0.16, 10, 40), cream, centre);
  wheel.add(ring, mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.48, 12), gold, centre));
  wheel.children.at(-1).rotation.x = Math.PI / 2;
  for (let spoke = 0; spoke < 16; spoke += 1) {
    const angle = (spoke / 16) * Math.PI * 2;
    const end = new THREE.Vector3(Math.cos(angle) * 5.02, 6.5 + Math.sin(angle) * 5.02, 0);
    wheel.add(beamBetween(centre, end, gold, 0.045));
    if (spoke % 2 === 0) {
      const cabinGroup = new THREE.Group();
      const cabinBody = mesh(new THREE.BoxGeometry(0.7, 0.56, 0.6), cabin, [0, -0.42, 0]);
      const roof = mesh(new THREE.BoxGeometry(0.76, 0.08, 0.66), cream, [0, -0.09, 0]);
      cabinGroup.add(cabinBody, roof);
      cabinGroup.position.copy(end);
      wheel.add(cabinGroup);
    }
  }
  for (const side of [-1, 1]) {
    const support = beamBetween(new THREE.Vector3(side * 4.4, 0.35, 0.6), new THREE.Vector3(side * 0.75, 6.2, 0.25), dark, 0.16);
    const rearSupport = beamBetween(new THREE.Vector3(side * 4.4, 0.35, -0.6), new THREE.Vector3(side * 0.75, 6.2, -0.25), dark, 0.16);
    wheel.add(support, rearSupport);
  }
  wheel.add(mesh(new THREE.BoxGeometry(12.8, 0.45, 4.4), new THREE.MeshStandardMaterial({ color: 0xd9d0ba, roughness: 0.82 }), [0, 0.22, 0]));
  for (let lamp = -5; lamp <= 5; lamp += 2) {
    wheel.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.7, 6), dark, [lamp, 0.78, 1.75]));
    wheel.add(mesh(new THREE.SphereGeometry(0.11, 8, 6), glow, [lamp, 1.15, 1.75]));
  }
  wheel.position.set(x, 0, z);
  scene.add(wheel);
  addBoxCollider(x, z, 6.7, 2.6);
  makeLabel("Wheel of Brisbane", x, 13.1, z);
}

function makeStoryBridge(x, z) {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0x56646b, roughness: 0.38, metalness: 0.72 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x2f3b42, roughness: 0.42, metalness: 0.64 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xaeb3ae, roughness: 0.82 });
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x303b3e, roughness: 0.88 });
  const line = new THREE.MeshStandardMaterial({ color: 0xf7e6a0, roughness: 0.75, emissive: 0x332900 });
  const road = mesh(new THREE.BoxGeometry(30, 0.55, 4.6), asphalt, [0, 4.45, 0]);
  const underDeck = mesh(new THREE.BoxGeometry(30.5, 0.35, 5.15), darkSteel, [0, 4.1, 0]);
  group.add(road, underDeck);
  const leftRampStart = new THREE.Vector3(-15, 4.45, 0);
  const leftRampEnd = new THREE.Vector3(-29, 0.32, 0);
  const rightRampStart = new THREE.Vector3(15, 4.45, 0);
  const rightRampEnd = new THREE.Vector3(29, 0.32, 0);
  for (const [start, end] of [[leftRampStart, leftRampEnd], [rightRampStart, rightRampEnd]]) {
    const direction = end.clone().sub(start);
    const ramp = mesh(new THREE.BoxGeometry(direction.length(), 0.52, 4.6), asphalt, start.clone().add(end).multiplyScalar(0.5));
    ramp.rotation.z = Math.atan2(direction.y, direction.x);
    group.add(ramp);
    const rampUnder = mesh(new THREE.BoxGeometry(direction.length() + 0.3, 0.32, 5.12), darkSteel, start.clone().add(end).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.38, 0)));
    rampUnder.rotation.z = Math.atan2(direction.y, direction.x);
    group.add(rampUnder);
    group.add(mesh(new THREE.BoxGeometry(2.3, 1.1, 5.4), concrete, [end.x, 0.55, 0]));
    for (const side of [-1, 1]) group.add(beamBetween(new THREE.Vector3(start.x, start.y + 0.65, side * 2.1), new THREE.Vector3(end.x, end.y + 0.65, side * 2.1), steel, 0.07));
  }
  for (let lane = -12; lane <= 12; lane += 3) group.add(mesh(new THREE.BoxGeometry(1.45, 0.025, 0.12), line, [lane, 4.75, 0]));
  for (const side of [-1, 1]) {
    group.add(mesh(new THREE.BoxGeometry(30, 0.18, 0.16), steel, [0, 5.15, side * 2.12]));
    for (let post = -14; post <= 14; post += 2) group.add(mesh(new THREE.BoxGeometry(0.1, 0.92, 0.1), steel, [post, 4.7, side * 2.12]));
  }
  for (const pierX of [-10, 0, 10]) {
    group.add(mesh(new THREE.BoxGeometry(1.2, 4, 3.4), concrete, [pierX, 2, 0]));
    group.add(mesh(new THREE.BoxGeometry(2.1, 0.42, 4.1), concrete, [pierX, 3.92, 0]));
  }
  for (const side of [-1, 1]) {
    const archPoints = [];
    for (let step = 0; step <= 16; step += 1) {
      const bridgeX = -14 + step * 1.75;
      archPoints.push(new THREE.Vector3(bridgeX, 5.2 + 5.1 * (1 - (bridgeX / 14) ** 2), side * 1.45));
    }
    for (let step = 0; step < archPoints.length - 1; step += 1) group.add(beamBetween(archPoints[step], archPoints[step + 1], steel, 0.13));
    for (let step = 0; step < archPoints.length; step += 2) {
      const top = archPoints[step];
      const deckPoint = new THREE.Vector3(top.x, 5.1, side * 1.45);
      group.add(beamBetween(deckPoint, top, steel, 0.075));
      if (step < archPoints.length - 1) group.add(beamBetween(deckPoint, archPoints[step + 1], darkSteel, 0.055));
    }
  }
  for (const bridgeX of [-14, 14]) {
    group.add(mesh(new THREE.BoxGeometry(0.8, 8.2, 5.4), concrete, [bridgeX, 4.1, 0]));
    group.add(mesh(new THREE.BoxGeometry(1.25, 0.45, 5.9), concrete, [bridgeX, 8.15, 0]));
  }
  const lampMaterial = new THREE.MeshStandardMaterial({ color: 0xffd37b, emissive: 0xffa22e, emissiveIntensity: 2.2 });
  for (let lampX = -12; lampX <= 12; lampX += 4) {
    for (const side of [-1, 1]) {
      group.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.35, 6), darkSteel, [lampX, 5.85, side * 2.25]));
      group.add(mesh(new THREE.SphereGeometry(0.12, 8, 6), lampMaterial, [lampX, 6.5, side * 2.25]));
    }
  }
  group.position.set(x, 0, z);
  scene.add(group);
  // The deck spans 30 units and each approach ramp extends a further 14 units.
  // Keep the full bridge footprint solid, rather than just its centre span.
  addBoxCollider(x, z, 30, 2.7);
  makeLabel("Story Bridge", x, 12.7, z);
}

function beamBetween(start, end, material, radius) {
  const direction = end.clone().sub(start);
  const beam = mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 8), material, start.clone().add(end).multiplyScalar(0.5));
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return beam;
}

function makeQueensWharf(x, z) {
  const group = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({ color: 0x4d8190, roughness: 0.3, metalness: 0.25 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xe7d5b0, roughness: 0.75 });
  for (const [offsetX, height, offsetZ] of [[0, 12, 0], [3.2, 8, 1], [-3.4, 6, 1.4], [1.7, 4.8, 4]]) {
    group.add(mesh(new THREE.BoxGeometry(2.5, height, 2.5), glass, [offsetX, height / 2, offsetZ]));
    group.add(mesh(new THREE.BoxGeometry(2.8, 0.5, 2.8), stone, [offsetX, 0.25, offsetZ]));
  }
  const terrace = mesh(new THREE.BoxGeometry(12, 0.7, 5.5), stone, [0, 0.35, 3.8]);
  group.add(terrace);
  group.position.set(x, 0, z);
  scene.add(group);
  addBoxCollider(x, z + 1.8, 6.2, 4.8);
  makeLabel("Queen's Wharf", x, 14.4, z + 1);
}

function makeCitySkyline(x, z) {
  const group = new THREE.Group();
  const concrete = new THREE.MeshStandardMaterial({ color: 0xd6d1c5, roughness: 0.75 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x416d7d, roughness: 0.24, metalness: 0.3 });
  const warmWindow = new THREE.MeshStandardMaterial({ color: 0xffcc70, emissive: 0x7f4710, emissiveIntensity: 0.25 });
  const towers = [[-14, 19, 0], [-8, 12, 2], [-2, 25, -1], [5, 16, 1], [12, 21, -2], [18, 10, 2]];
  for (const [offsetX, height, offsetZ] of towers) {
    const width = 3 + (height % 3);
    group.add(mesh(new THREE.BoxGeometry(width, height, 3.2), concrete, [offsetX, height / 2, offsetZ]));
    const facade = mesh(new THREE.BoxGeometry(width * 0.72, height * 0.92, 0.06), glass, [offsetX, height / 2, offsetZ + 1.64]);
    group.add(facade);
    for (let floor = 2; floor < height - 1; floor += 2.1) {
      const light = mesh(new THREE.BoxGeometry(width * 0.45, 0.22, 0.08), warmWindow, [offsetX, floor, offsetZ + 1.7]);
      group.add(light);
    }
    addBoxCollider(x + offsetX, z + offsetZ, width / 2, 1.8);
  }
  group.position.set(x, 0, z);
  scene.add(group);
  makeLabel("Brisbane CBD", x + 1, 27, z + 1);
}

function createCreature(data) {
  const group = new THREE.Group();
  const main = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.78, flatShading: true });
  const accent = new THREE.MeshStandardMaterial({ color: data.accent, roughness: 0.78, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1d2924, roughness: 1 });

  const kind = data.kind || data.id;
  if (kind === "ibis") {
    const white = new THREE.MeshStandardMaterial({ color: 0xf4f2e8, roughness: 0.72, metalness: 0.02 });
    const featherGrey = new THREE.MeshStandardMaterial({ color: 0xcbd2ce, roughness: 0.82 });
    const bareBlack = new THREE.MeshStandardMaterial({ color: 0x172220, roughness: 0.9 });
    const eyeGold = new THREE.MeshStandardMaterial({ color: 0xe4b440, emissive: 0x4a3000, emissiveIntensity: 0.25 });
    const body = mesh(new THREE.SphereGeometry(0.78, 24, 16), white, [-0.08, 1.18, 0]);
    body.scale.set(1.12, 0.96, 0.74);
    group.add(body);
    for (const side of [-1, 1]) {
      const wing = mesh(new THREE.SphereGeometry(0.55, 18, 12), featherGrey, [-0.2, 1.22, side * 0.5]);
      wing.scale.set(1.36, 0.36, 0.66);
      wing.rotation.x = side * 0.25;
      group.add(wing);
      for (let feather = 0; feather < 4; feather += 1) {
        const quill = mesh(new THREE.ConeGeometry(0.12, 0.72, 8), white, [-0.55 - feather * 0.13, 1.02 - feather * 0.05, side * (0.56 + feather * 0.035)]);
        quill.rotation.z = -Math.PI / 2.25;
        quill.rotation.x = side * 0.22;
        group.add(quill);
      }
    }
    const neckCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.22, 1.45, 0), new THREE.Vector3(0.3, 1.9, 0), new THREE.Vector3(0.18, 2.18, 0), new THREE.Vector3(0.38, 2.42, 0)]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 20, 0.14, 10, false), white));
    group.add(mesh(new THREE.SphereGeometry(0.24, 14, 10), bareBlack, [0.45, 2.45, 0]));
    const billCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.57, 2.43, 0), new THREE.Vector3(0.93, 2.37, 0), new THREE.Vector3(1.16, 2.16, 0), new THREE.Vector3(1.03, 1.96, 0)]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(billCurve, 18, 0.05, 7, false), bareBlack));
    for (const side of [-1, 1]) {
      group.add(mesh(new THREE.SphereGeometry(0.055, 10, 8), eyeGold, [0.57, 2.51, side * 0.17]));
      const leg = mesh(new THREE.CylinderGeometry(0.032, 0.043, 1.06, 8), bareBlack, [-0.05, 0.47, side * 0.2]);
      group.add(leg);
      const toe = mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.3, 6), bareBlack, [0.09, 0.0, side * 0.2]); toe.rotation.z = Math.PI / 2; group.add(toe);
    }
  } else if (kind === "bird") {
    const body = mesh(new THREE.SphereGeometry(0.62, 16, 12), accent, [0, 1.05, 0]);
    body.scale.set(1.2, 0.92, 0.78);
    const head = mesh(new THREE.SphereGeometry(0.27, 14, 10), accent, [0.27, 1.74, 0]);
    group.add(body, head);
    const beak = mesh(new THREE.ConeGeometry(0.1, 0.75, 6), dark, [0.5, 1.72, 0]); beak.rotation.z = -Math.PI / 2; group.add(beak);
    for (const side of [-1, 1]) {
      const wing = mesh(new THREE.SphereGeometry(0.42, 12, 9), main, [-0.1, 1.1, side * 0.4]); wing.scale.set(1.35, 0.26, 0.68); wing.rotation.x = side * 0.24; group.add(wing);
      group.add(mesh(new THREE.SphereGeometry(0.042, 8, 6), dark, [0.39, 1.81, side * 0.22]));
    }
    for (const legX of [-0.18, 0.18]) group.add(mesh(new THREE.CylinderGeometry(0.028, 0.035, 0.85, 6), dark, [legX, 0.42, 0]));
  } else if (kind === "turkey") {
    const feathers = new THREE.MeshStandardMaterial({ color: 0x161b1c, roughness: 0.82, metalness: 0.06 });
    const sheen = new THREE.MeshStandardMaterial({ color: 0x314339, roughness: 0.56, metalness: 0.22 });
    const redSkin = new THREE.MeshStandardMaterial({ color: 0xb34332, roughness: 0.84 });
    const blueSkin = new THREE.MeshStandardMaterial({ color: 0x41798a, roughness: 0.76 });
    const goldWattle = new THREE.MeshStandardMaterial({ color: 0xf3c544, roughness: 0.7 });
    const body = mesh(new THREE.SphereGeometry(0.88, 22, 15), feathers, [-0.1, 1.0, 0]); body.scale.set(1.14, 0.95, 0.78); group.add(body);
    for (const side of [-1, 1]) {
      const wing = mesh(new THREE.SphereGeometry(0.58, 14, 10), sheen, [-0.22, 1.1, side * 0.55]); wing.scale.set(1.2, 0.3, 0.68); group.add(wing);
      for (let feather = 0; feather < 4; feather += 1) {
        const tailFeather = mesh(new THREE.ConeGeometry(0.15, 1.3, 7), sheen, [-0.85 - feather * 0.08, 1.35 + feather * 0.1, side * (0.14 + feather * 0.12)]);
        tailFeather.rotation.z = -Math.PI / 2.55;
        group.add(tailFeather);
      }
    }
    const neck = mesh(new THREE.CylinderGeometry(0.16, 0.25, 0.72, 10), redSkin, [0.5, 1.48, 0]); neck.rotation.z = -0.5; group.add(neck);
    group.add(mesh(new THREE.SphereGeometry(0.31, 14, 10), blueSkin, [0.78, 1.83, 0]));
    group.add(mesh(new THREE.ConeGeometry(0.11, 0.34, 6), dark, [1.09, 1.83, 0]).rotateZ(-Math.PI / 2));
    const wattle = mesh(new THREE.CapsuleGeometry(0.09, 0.36, 5, 8), goldWattle, [0.7, 1.56, -0.12]); wattle.rotation.z = -0.3; group.add(wattle);
    for (const side of [-1, 1]) {
      group.add(mesh(new THREE.SphereGeometry(0.04, 8, 6), dark, [0.93, 1.93, side * 0.21]));
      group.add(mesh(new THREE.CylinderGeometry(0.042, 0.058, 0.72, 7), redSkin, [-0.18, 0.35, side * 0.22]));
    }
  } else if (kind === "cockatoo") {
    group.add(mesh(new THREE.SphereGeometry(0.67, 10, 8), main, [0, 1.16, 0]));
    group.add(mesh(new THREE.SphereGeometry(0.3, 8, 6), main, [0.26, 1.83, 0]));
    for (let i = -2; i <= 2; i += 1) { const crest = mesh(new THREE.ConeGeometry(0.08, 0.62, 5), accent, [0.18 + i * 0.1, 2.2, 0]); crest.rotation.z = i * 0.18; group.add(crest); }
    const beak = mesh(new THREE.ConeGeometry(0.11, 0.38, 6), dark, [0.56, 1.82, 0]); beak.rotation.z = -Math.PI / 2; group.add(beak);
    for (const side of [-1, 1]) {
      const wing = mesh(new THREE.SphereGeometry(0.44, 10, 8), main, [-0.12, 1.18, side * 0.4]); wing.scale.set(1.2, 0.22, 0.62); group.add(wing);
      group.add(mesh(new THREE.SphereGeometry(0.04, 8, 6), dark, [0.45, 1.9, side * 0.2]));
    }
  } else if (kind === "dragon") {
    const body = mesh(new THREE.CapsuleGeometry(0.38, 1.3, 6, 10), main, [0, 0.48, 0]); body.rotation.z = Math.PI / 2; group.add(body);
    const head = mesh(new THREE.ConeGeometry(0.36, 0.65, 5), accent, [1.08, 0.52, 0]); head.rotation.z = Math.PI / 2; group.add(head);
    const tail = mesh(new THREE.ConeGeometry(0.22, 1.9, 6), main, [-1.45, 0.4, 0]); tail.rotation.z = -Math.PI / 2; group.add(tail);
    for (const side of [-1, 1]) group.add(mesh(new THREE.SphereGeometry(0.05, 8, 6), dark, [1.3, 0.67, side * 0.2]));
  } else {
    group.add(mesh(new THREE.SphereGeometry(0.66, 10, 8), main, [0, 1.1, 0]));
    group.add(mesh(new THREE.SphereGeometry(0.38, 8, 6), accent, [0.43, 1.5, 0]));
    group.add(mesh(new THREE.ConeGeometry(0.22, 1.4, 8), main, [-1.0, 1.2, 0], true));
    for (const x of [0.15, 0.45]) group.add(mesh(new THREE.ConeGeometry(0.1, 0.6, 6), main, [x, 2.05, 0]));
    for (const side of [-1, 1]) group.add(mesh(new THREE.SphereGeometry(0.04, 8, 6), dark, [0.66, 1.62, side * 0.21]));
  }

  group.position.set(...data.pos);
  group.userData = { ...data, baseY: 0, caught: false, phase: Math.random() * Math.PI * 2 };
  group.visible = false;
  scene.add(group);
  return group;
}

function chooseRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function districtFor(position) {
  return districts.reduce((nearest, district) => position.distanceToSquared(district.position) < position.distanceToSquared(nearest.position) ? district : nearest).name;
}

function updateObjective() {
  objective.textContent = catches.size === creatures.length
    ? "Brissydex complete — Brisbane wildlife discovered!"
    : `${creatures.length - catches.size} creatures still waiting to be discovered.`;
}

function activateNextSighting() {
  const candidates = creatureObjects.filter((creature) => !creature.userData.caught && !creature.visible);
  if (candidates.length === 0) return;
  const creature = chooseRandom(candidates);
  const occupied = creatureObjects.filter((item) => item.visible).map((item) => item.position);
  const freeSites = spawnSites.filter((site) => site.distanceTo(player) > 6 && !isBlocked(site, 0.85) && occupied.every((position) => position.distanceTo(site) > 5));
  const fallbackSites = spawnSites.filter((site) => site.distanceTo(player) > 4 && !isBlocked(site, 0.55));
  const site = chooseRandom(freeSites.length ? freeSites : fallbackSites.length ? fallbackSites : spawnSites);
  creature.position.copy(site).add(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2));
  creature.userData.baseY = 0;
  creature.userData.homePosition = creature.position.clone();
  creature.userData.district = districtFor(creature.position);
  creature.userData.behaviourPhase = Math.random() * Math.PI * 2;
  creature.visible = true;
  sightingHint.innerHTML = `<span>Latest sighting</span><strong>Explore ${creature.userData.district}</strong>`;
  showMessage(`A wildlife sighting was reported around ${creature.userData.district}.`);
}

function seedSightings() {
  for (let index = 0; index < 6; index += 1) activateNextSighting();
  updateObjective();
}

function renderGuide() {
  guideCount.textContent = `${catches.size} / ${creatures.length}`;
  guideList.innerHTML = creatures.map((creature) => `
    <button class="guide-entry ${catches.has(creature.id) ? "caught" : ""} ${selectedCreatureId === creature.id ? "selected" : ""}" type="button" data-creature-id="${creature.id}" ${catches.has(creature.id) ? "" : "disabled"}>
      <span class="guide-icon" aria-hidden="true">${creatureIcons[creature.id]}</span>
      <div><strong>${catches.has(creature.id) ? creature.name : "Unknown creature"}</strong><small>${catches.has(creature.id) ? creature.subtitle : "Explore to discover"}</small></div>
    </button>
  `).join("");
  dexDetail.innerHTML = catches.size
    ? "<p>Select a discovered creature to open its glass field card, facts, and habitat notes.</p>"
    : "<p>Catch a creature to unlock its Brisbane wildlife knowledge.</p>";
}

function showCreatureCard(creature) {
  if (!creature || !catches.has(creature.id)) return;
  selectedCreatureId = creature.id;
  dexPopoutIcon.textContent = creatureIcons[creature.id];
  dexPopoutSpecies.textContent = creature.subtitle;
  dexPopoutName.textContent = creature.name;
  dexPopoutFound.innerHTML = `<strong>Found:</strong> ${creature.habitat}`;
  dexPopoutInfo.textContent = knowledge[creature.id];
  dexPopoutFact.textContent = funFacts[creature.id];
  dexPopout.hidden = false;
  renderGuide();
  dexPopoutClose.focus();
}

function closeCreatureCard() {
  dexPopout.hidden = true;
}

function setBrissydex(open) {
  brissydex.hidden = !open;
  brissydexButton.setAttribute("aria-expanded", String(open));
  if (!open) closeCreatureCard();
  if (open) {
    const selected = creatures.find((creature) => creature.id === selectedCreatureId && catches.has(creature.id)) || creatures.find((creature) => catches.has(creature.id));
    if (selected) showCreatureCard(selected);
  }
  if (open && pointerLocked) document.exitPointerLock();
}

function showMessage(text) {
  message.textContent = text;
  message.classList.add("visible");
  clearTimeout(showMessageTimer);
  showMessageTimer = setTimeout(() => message.classList.remove("visible"), 2800);
}

function playTone(frequency, startTime, duration, volume, type = "sine") {
  const oscillator = musicContext.createOscillator();
  const gain = musicContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain).connect(musicContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
}

function scheduleMusic() {
  if (!musicEnabled || !musicContext) return;
  const now = musicContext.currentTime + 0.05;
  const melody = [392, 440, 523.25, 440, 349.23, 392, 440, 329.63];
  const bass = [130.81, 146.83, 110, 123.47];
  melody.forEach((note, index) => playTone(note, now + index * 0.36, 0.3, 0.042, "triangle"));
  bass.forEach((note, index) => {
    playTone(note, now + index * 0.72, 0.62, 0.024, "sine");
    playTone(note * 1.5, now + index * 0.72 + 0.06, 0.42, 0.012, "sine");
  });
  musicTimer = window.setTimeout(scheduleMusic, 2880);
}

async function startMusic() {
  if (!musicContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    musicContext = new AudioContext();
  }
  await musicContext.resume();
  if (musicEnabled) return;
  musicEnabled = true;
  musicButton.textContent = "♫ Music off";
  musicButton.classList.add("is-playing");
  musicButton.setAttribute("aria-pressed", "true");
  scheduleMusic();
}

function stopMusic() {
  musicEnabled = false;
  window.clearTimeout(musicTimer);
  musicButton.textContent = "♫ Music on";
  musicButton.classList.remove("is-playing");
  musicButton.setAttribute("aria-pressed", "false");
  musicContext?.suspend();
}

function captureCreature(target) {
  if (!target || target.userData.caught) return;
  const data = target.userData;
  data.caught = true;
  catches.add(data.id);
  selectedCreatureId = data.id;
  target.visible = false;
  activeCreature = null;
  catchPrompt.classList.add("is-hidden");
  renderGuide();
  showMessage(`Caught ${data.name}! Added to your Brissydex — press B to learn more.`);
  updateObjective();
  if (catches.size < creatures.length) setTimeout(activateNextSighting, 850);
}

function throwOrb() {
  if (remainingOrbs <= 0) {
    orbWarning.hidden = false;
    showMessage("No Catch Orbs left — reload the game to refill your bag.");
    return;
  }
  if (!pointerLocked || thrownOrbs.length > 0) return;
  const orb = createCatchOrb();
  trainer.userData.hand.getWorldPosition(orb.position);
  const target = activeCreature && !activeCreature.userData.caught ? activeCreature : null;
  const targetPoint = target?.position.clone().add(new THREE.Vector3(0, 1, 0));
  const direction = targetPoint ? targetPoint.clone().sub(orb.position).normalize() : playerDirection.clone().normalize();
  orb.position.add(direction.clone().multiplyScalar(0.35));
  scene.add(orb);
  let velocity = direction.multiplyScalar(17).add(new THREE.Vector3(0, 2.2, 0));
  if (targetPoint) {
    const flightTime = THREE.MathUtils.clamp(orb.position.distanceTo(targetPoint) / 17, 0.22, 0.55);
    velocity = targetPoint.sub(orb.position).multiplyScalar(1 / flightTime).add(new THREE.Vector3(0, 4 * flightTime, 0));
  }
  thrownOrbs.push({ mesh: orb, velocity, age: 0, target });
  remainingOrbs -= 1;
  orbCount.textContent = remainingOrbs;
  if (remainingOrbs === 0) {
    orbBag.classList.add("is-empty");
    orbWarning.hidden = false;
    showMessage("Last Catch Orb thrown — this is your final chance before reloading.");
  } else {
    showMessage(target ? `Catch assist locked on ${target.userData.name}!` : "Catch Orb thrown — aim for a creature!");
  }
}

function updateCamera(delta) {
  if (cityView) {
    scene.fog.color.set(0x9edbed);
    scene.fog.near = 58;
    scene.fog.far = 155;
    camera.position.lerp(cityCameraPosition, Math.min(delta * 3.4, 1));
    camera.lookAt(cityCameraTarget);
    trainer.visible = true;
    trainer.userData.handOrb.visible = false;
    return;
  }
  scene.fog.color.set(0x9edbed);
  scene.fog.near = 34;
  scene.fog.far = 88;
  const movementForward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(-movementForward.z, 0, movementForward.x);
  const move = new THREE.Vector3();
  if (keys.has("KeyW")) move.add(movementForward);
  if (keys.has("KeyS")) move.sub(movementForward);
  if (keys.has("KeyD")) move.add(right);
  if (keys.has("KeyA")) move.sub(right);
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(10 * Math.min(delta, 0.05));
    movePlayer(move);
    playerMoving = true;
  } else {
    playerMoving = false;
  }
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const desiredCamera = player.clone().add(new THREE.Vector3(0, 3.2, 0)).addScaledVector(forward, -6.1);
  const target = player.clone().add(new THREE.Vector3(0, 1.4 + pitch * 1.2, 0)).addScaledVector(forward, 2.2);
  camera.position.lerp(resolveCameraPosition(target, desiredCamera), Math.min(delta * 7, 1));
  camera.lookAt(target);
  camera.getWorldDirection(playerDirection);
  trainer.position.copy(player);
  trainer.rotation.y = yaw;
  trainer.visible = camera.position.distanceTo(player) > 2.85;
  trainer.userData.handOrb.visible = remainingOrbs > 0;
  const walk = Math.sin(clock.elapsedTime * 10) * (playerMoving ? 0.55 : 0);
  trainer.userData.legs[0].rotation.x = walk;
  trainer.userData.legs[1].rotation.x = -walk;
  trainer.userData.throwArm.rotation.x = playerMoving ? -walk * 0.45 : 0;
}

function setCityView(enabled) {
  cityView = enabled;
  document.body.classList.toggle("city-view", cityView);
  cityViewButton.innerHTML = cityView ? "Return to wildlife <kbd>C</kbd>" : "View Brisbane <kbd>C</kbd>";
  if (cityView && pointerLocked) document.exitPointerLock();
  showMessage(cityView ? "City View: Story Bridge, Queen's Wharf, Wheel of Brisbane, and the CBD." : "Wildlife View: move through the park to find creatures.");
}

function updateCreatures(time) {
  let closest = null;
  let closestDistance = Infinity;
  creatureObjects.forEach((creature, index) => {
    if (creature.userData.caught || !creature.visible) return;
    const data = creature.userData;
    const home = data.homePosition || creature.position;
    const kind = data.kind || data.id;
    const phase = data.behaviourPhase || data.phase;
    const clockTime = time * 0.001;
    let radius = 0.24;
    let pace = 0.72;
    let hop = 0.035;
    if (kind === "turkey" || kind === "ibis") { radius = 0.58; pace = 0.52; hop = 0.02; }
    if (kind === "dragon") { radius = 0.36; pace = 0.42; hop = 0.008; }
    if (kind === "possum") { radius = 0.3; pace = 0.38; hop = 0.05; }
    if (data.id === "flying-fox") { radius = 0.7; pace = 0.65; hop = 1.15; }
    const stride = clockTime * pace + phase;
    const xOffset = Math.cos(stride) * radius;
    const zOffset = Math.sin(stride * 0.82) * radius * 0.7;
    creature.position.x = home.x + xOffset;
    creature.position.z = home.z + zOffset;
    creature.position.y = data.baseY + Math.abs(Math.sin(stride * 2.4)) * hop;
    creature.rotation.y = Math.atan2(-Math.sin(stride * 0.82), Math.sin(stride));
    creature.rotation.z = kind === "dragon" ? Math.sin(stride * 1.5) * 0.05 : 0;
    const distance = player.distanceTo(creature.position);
    if (distance < closestDistance) { closest = creature; closestDistance = distance; }
  });
  if (closest && closestDistance < 4.6) {
    activeCreature = closest;
    catchPromptText.textContent = `${closest.userData.name} is nearby — throw a Catch Orb!`;
    catchPrompt.classList.remove("is-hidden");
  } else {
    activeCreature = null;
    catchPrompt.classList.add("is-hidden");
  }
}

function updateThrownOrbs(delta) {
  for (let index = thrownOrbs.length - 1; index >= 0; index -= 1) {
    const orb = thrownOrbs[index];
    orb.age += delta;
    orb.velocity.y -= 8 * delta;
    orb.mesh.position.addScaledVector(orb.velocity, delta);
    orb.mesh.rotation.x += 18 * delta;
    orb.mesh.rotation.z += 12 * delta;
    const hitRadius = orb.target ? 1.9 : 1.65;
    const hit = creatureObjects.find((creature) => !creature.userData.caught && creature.visible && orb.mesh.position.distanceTo(creature.position.clone().add(new THREE.Vector3(0, 1, 0))) < hitRadius);
    if (hit) {
      scene.remove(orb.mesh);
      thrownOrbs.splice(index, 1);
      captureCreature(hit);
      continue;
    }
    if (orb.age > 2.2 || orb.mesh.position.y < 0) {
      scene.remove(orb.mesh);
      thrownOrbs.splice(index, 1);
      if (activeCreature) showMessage("Missed! Move closer, put the creature near the crosshair, then throw again.");
    }
  }
}

function animate(time) {
  const delta = clock.getDelta();
  updateAtmosphere(time);
  updateCamera(delta);
  updateCreatures(time);
  updateThrownOrbs(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

addLights();
makeGround();
makeBrightDayAtmosphere();
makeLandmarks();
creatureObjects = creatures.map(createCreature);
renderGuide();
seedSightings();
updateCamera(1);
requestAnimationFrame(animate);

startButton.addEventListener("click", () => {
  startMusic();
  renderer.domElement.requestPointerLock();
});
renderer.domElement.addEventListener("click", () => {
  if (!pointerLocked) {
    startMusic();
    renderer.domElement.requestPointerLock();
  }
});
document.addEventListener("pointerlockchange", () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
  startButton.classList.toggle("is-hidden", pointerLocked);
});
document.addEventListener("mousemove", (event) => {
  if (!pointerLocked) return;
  yaw -= event.movementX * 0.0026;
  pitch = THREE.MathUtils.clamp(pitch - event.movementY * 0.0022, -0.75, 0.5);
});
document.addEventListener("keydown", (event) => {
  if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) keys.add(event.code);
  if (event.code === "Space") { event.preventDefault(); throwOrb(); }
  if (event.code === "KeyC") setCityView(!cityView);
  if (event.code === "KeyB") setBrissydex(brissydex.hidden);
  if (event.code === "Escape") closeCreatureCard();
});
document.addEventListener("keyup", (event) => keys.delete(event.code));
renderer.domElement.addEventListener("mousedown", (event) => { if (pointerLocked && event.button === 0) throwOrb(); });
catchButton.addEventListener("click", throwOrb);
cityViewButton.addEventListener("click", () => setCityView(!cityView));
brissydexButton.addEventListener("click", () => setBrissydex(brissydex.hidden));
brissydexClose.addEventListener("click", () => setBrissydex(false));
dexPopoutClose.addEventListener("click", closeCreatureCard);
musicButton.addEventListener("click", () => { if (musicEnabled) stopMusic(); else startMusic(); });
guideList.addEventListener("click", (event) => {
  const entry = event.target.closest("[data-creature-id]");
  if (!entry || entry.disabled) return;
  showCreatureCard(creatures.find((creature) => creature.id === entry.dataset.creatureId));
});
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
