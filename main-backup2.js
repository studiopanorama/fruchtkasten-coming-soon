import decomp from 'poly-decomp';
import Matter from 'matter-js';
import 'pathseg';

Matter.Common.setDecomp(decomp);
window.decomp = decomp; // notwendig für komplexe SVG-Polygone

const { Engine, Render, Runner, World, Bodies, Body, Svg, Vertices } = Matter;

// Setup Canvas
const canvas = document.getElementById('bg');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const engine = Engine.create();
const render = Render.create({
  canvas,
  engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: 'transparent'
  }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Boden
const floor = Bodies.rectangle(
  window.innerWidth / 2,
  window.innerHeight + 50,
  window.innerWidth,
  100,
  { isStatic: true, render: { visible: false } }
);
World.add(engine.world, floor);

// SVG laden und in Körper umwandeln
async function loadSvgVertices(url) {
  const res = await fetch(url);
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');
  const path = doc.querySelector('path');
  return Svg.pathToVertices(path, 20);
}

const svgPaths = [
  '/assets/svgShapes/shape1.svg',
  '/assets/svgShapes/shape2.svg',
  '/assets/svgShapes/shape3.svg',
  '/assets/svgShapes/shape4.svg'
];

// const test = Bodies.rectangle(200, 200, 80, 80, {
//   render: { fillStyle: '#9f132a' }
// });
// World.add(engine.world, test);


const activeShapes = [];
const isMobile = window.innerWidth < 600;
const maxMobileShapes = 50;

async function spawnSvgShape() {
  const url = svgPaths[Math.floor(Math.random() * svgPaths.length)];
  const vertices = await loadSvgVertices(url);
  const scale = isMobile ? 0.5 : 1.0;

//Seitenwände
const wallThickness = 100; // breit genug, um nichts durchzulassen

const leftWall = Matter.Bodies.rectangle(
  -wallThickness / 2, // leicht außerhalb des linken Rands
  window.innerHeight / 2,
  wallThickness,
  window.innerHeight * 2,
  { isStatic: true, render: { visible: false } }
);

const rightWall = Matter.Bodies.rectangle(
  window.innerWidth + wallThickness / 2, // leicht außerhalb des rechten Rands
  window.innerHeight / 2,
  wallThickness,
  window.innerHeight * 2,
  { isStatic: true, render: { visible: false } }
);

// Wände hinzufügen
Matter.World.add(engine.world, [leftWall, rightWall]);

  const scaledVerts = vertices.map(v => ({ x: v.x * scale, y: v.y * scale }));

  const body = Matter.Bodies.fromVertices(
    Math.random() * window.innerWidth,
    -100,
    scaledVerts,
    {
      restitution: 0.5,
      render: {
        fillStyle: '#9f132a',
        strokeStyle: '#9f132a',
        lineWidth: 1
      }
    },
    true
  );

  if (body) {
    Matter.World.add(engine.world, body);
    activeShapes.push(body);

    // 💣 Nur auf Mobilgeräten: nach 20 s entfernen
    if (isMobile) {
      setTimeout(() => {
        Matter.World.remove(engine.world, body);
        const index = activeShapes.indexOf(body);
        if (index > -1) activeShapes.splice(index, 1);
      }, 5000);
    }
  }
}

// async function spawnSvgShape() {
//   const url = svgPaths[Math.floor(Math.random() * svgPaths.length)];
//   const vertices = await loadSvgVertices(url);

//   // Seitenwände
// const wallThickness = 100; // breit genug, um nichts durchzulassen

// const leftWall = Matter.Bodies.rectangle(
//   -wallThickness / 2, // leicht außerhalb des linken Rands
//   window.innerHeight / 2,
//   wallThickness,
//   window.innerHeight * 2,
//   { isStatic: true, render: { visible: false } }
// );

// const rightWall = Matter.Bodies.rectangle(
//   window.innerWidth + wallThickness / 2, // leicht außerhalb des rechten Rands
//   window.innerHeight / 2,
//   wallThickness,
//   window.innerHeight * 2,
//   { isStatic: true, render: { visible: false } }
// );

// // Wände hinzufügen
// Matter.World.add(engine.world, [leftWall, rightWall]);

//   // Dynamische Skalierung abhängig von Fensterbreite
//   const scale = window.innerWidth < 500 ? 0.5 : 1.0;

//   const scaledVerts = vertices.map(vertex => ({
//     x: vertex.x * scale,
//     y: vertex.y * scale
//   }));

//   const body = Matter.Bodies.fromVertices(
//     Math.random() * window.innerWidth,
//     -100,
//     scaledVerts,
//     {
//       restitution: 0.5,
//       render: {
//         fillStyle: '#9f132a',
//         strokeStyle: '#333',
//         lineWidth: 0
//       }
//     },
//     true
//   );

//   if (body) {
//     Matter.World.add(engine.world, body);
//   }
// }


// alle 1 Sekunde eine neue Form
setInterval(spawnSvgShape, 1000);

// Device-Neigung für mobile Geräte
window.addEventListener("deviceorientation", function(event) {
  const gamma = event.gamma;
  const beta = event.beta;

  if (typeof gamma === "number" && typeof beta === "number") {
    engine.world.gravity.x = gamma / 90;
    engine.world.gravity.y = beta / 90;
  }
}, true);

// Responsiveness
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  Body.setPosition(floor, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
});
