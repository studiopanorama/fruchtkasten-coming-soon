// import './pathseg.js';
import Matter from 'matter-js';
import decomp from 'poly-decomp';
// import 'pathseg';

window.decomp = decomp;
Matter.Common.setDecomp(decomp);

const {
  Engine, Render, Runner, World, Bodies, Body, Svg
} = Matter;

const engine = Engine.create();
const canvas = document.getElementById('bg');

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
Runner.run(Runner.create(), engine);

// 🧱 Begrenzungen: Boden + Wände
const wallThickness = 100;

const floor = Bodies.rectangle(
  window.innerWidth / 2,
  window.innerHeight + 50,
  window.innerWidth,
  100,
  { isStatic: true, render: { visible: false } }
);

const leftWall = Bodies.rectangle(
  -wallThickness / 2,
  window.innerHeight / 2,
  wallThickness,
  window.innerHeight * 2,
  { isStatic: true, render: { visible: false } }
);

const rightWall = Bodies.rectangle(
  window.innerWidth + wallThickness / 2,
  window.innerHeight / 2,
  wallThickness,
  window.innerHeight * 2,
  { isStatic: true, render: { visible: false } }
);

World.add(engine.world, [floor, leftWall, rightWall]);

//resize listener für wände

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Boden neu positionieren
  Matter.Body.setPosition(floor, {
    x: window.innerWidth / 2,
    y: window.innerHeight + 50
  });
  Matter.Body.setVertices(floor, [
    { x: 0, y: window.innerHeight },
    { x: window.innerWidth, y: window.innerHeight },
    { x: window.innerWidth, y: window.innerHeight + 100 },
    { x: 0, y: window.innerHeight + 100 }
  ]);

  // Linke Wand
  Matter.Body.setPosition(leftWall, {
    x: -wallThickness / 2,
    y: window.innerHeight / 2
  });
  Matter.Body.setVertices(leftWall, [
    { x: -wallThickness, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: window.innerHeight * 2 },
    { x: -wallThickness, y: window.innerHeight * 2 }
  ]);

  // Rechte Wand
  Matter.Body.setPosition(rightWall, {
    x: window.innerWidth + wallThickness / 2,
    y: window.innerHeight / 2
  });
  Matter.Body.setVertices(rightWall, [
    { x: window.innerWidth, y: 0 },
    { x: window.innerWidth + wallThickness, y: 0 },
    { x: window.innerWidth + wallThickness, y: window.innerHeight * 2 },
    { x: window.innerWidth, y: window.innerHeight * 2 }
  ]);
});

function spawnInitialShapes(count = 20) {
  const availableWidth = window.innerWidth - 100;
  const spacing = availableWidth / count;

  for (let i = 0; i < count; i++) {
    const url = svgPaths[Math.floor(Math.random() * svgPaths.length)];
    loadSvgVertices(url).then(vertices => {
      const scale = 0.7; // Desktop-Scale
      const scaledVerts = vertices.map(v => ({
        x: v.x * scale,
        y: v.y * scale
      }));

      const x = 50 + i * spacing;
      const y = window.innerHeight - 200 - Math.random() * 100;

      let body = Matter.Bodies.fromVertices(x, y, scaledVerts, {
        restitution: 0.5,
        render: {
          fillStyle: 'rgba(159, 19, 42, 1)',
          strokeStyle: '#9f132a',
          lineWidth: 1
        }
      }, true);

      if (!body && scaledVerts.length > 2) {
        const fallbackVerts = scaledVerts.map(v => ({ x: v.x * 0.7, y: v.y * 0.7 }));
        body = Matter.Bodies.fromVertices(x, y, fallbackVerts, {
          restitution: 0.5,
          render: {
            fillStyle: 'rgba(159, 19, 42, 1)',
            strokeStyle: '#9f132a',
            lineWidth: 1
          }
        }, true);
      }

      if (body) {
        Matter.World.add(engine.world, body);
        activeShapes.push(body);
      }
    });
  }
}


// 🧠 SVG-Logik
const svgPaths = [
  '/assets/svgShapes/shape1.svg',
  '/assets/svgShapes/shape2.svg',
  '/assets/svgShapes/shape3.svg',
  '/assets/svgShapes/shape4.svg'
];

const activeShapes = [];
const isMobile = window.innerWidth < 600;
const maxShapes = isMobile ? 10 : 50;

async function loadSvgVertices(url) {
  const res = await fetch(url);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const path = doc.querySelector('path');
  return Svg.pathToVertices(path, 30);
}

async function spawnSvgShape() {
  if (activeShapes.length >= maxShapes) return;

  const url = svgPaths[Math.floor(Math.random() * svgPaths.length)];
  const vertices = await loadSvgVertices(url);
  const scale = isMobile ? 0.5 : 0.7;

  const scaledVerts = vertices.map(v => ({
    x: v.x * scale,
    y: v.y * scale
  }));

  const body = Bodies.fromVertices(
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
  if (!body) {
  console.warn("Body konnte nicht erzeugt werden", vertices);
  return;
}

  if (body) {
    World.add(engine.world, body);
    activeShapes.push(body);

    if (isMobile) {
      setTimeout(() => {
        World.remove(engine.world, body);
        const index = activeShapes.indexOf(body);
        if (index > -1) activeShapes.splice(index, 1);
      }, 8000);
    }
  }
}

if (!isMobile) {
  spawnInitialShapes(10);
}


// 🎯 alle 1 Sekunde ein neues Objekt
setInterval(spawnSvgShape, 1000);

// 📱 Mobilneigung → Gravitation anpassen
window.addEventListener("deviceorientation", (event) => {
  const gamma = event.gamma;
  const beta = event.beta;

  if (typeof gamma === "number" && typeof beta === "number") {
    engine.world.gravity.x = gamma / 90;
    engine.world.gravity.y = beta / 90;
  }
}, true);

// 🖥️ Bei Resize: Begrenzungen anpassen
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  Body.setPosition(floor, {
    x: window.innerWidth / 2,
    y: window.innerHeight + 50
  });

  Body.setPosition(leftWall, {
    x: -wallThickness / 2,
    y: window.innerHeight / 2
  });

  Body.setPosition(rightWall, {
    x: window.innerWidth + wallThickness / 2,
    y: window.innerHeight / 2
  });
});


window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.style.backgroundColor = '#e4004c';
  }, 500); // kleiner Delay vor Start
});
