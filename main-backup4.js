let sidebarIsOpen = false;

function getEffectiveWidth() {
  const sidebar = document.getElementById('sidebar');
  if (sidebarIsOpen && sidebar) {
    const sidebarWidth = sidebar.offsetWidth;
    return window.innerWidth - sidebarWidth;
  }
  return window.innerWidth;
}

function animateRightWallShift(targetX, duration = 300) {
  const startX = rightWall.position.x;
  const distance = targetX - startX;
  const steps = Math.round(duration / 16); // ca. 60fps
  let current = 0;

  function step() {
    if (current >= steps) return;

    const shift = distance / steps;
    Matter.Body.translate(rightWall, { x: shift, y: 0 });

    const newVerts = rightWall.vertices.map(v => ({ x: v.x + shift, y: v.y }));
    Matter.Body.setVertices(rightWall, newVerts);

    current++;
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}


function spawnInitialShapes(count = 10) {
  const effectiveWidth = getEffectiveWidth();
  const availableWidth = effectiveWidth - 100;
  const spacing = availableWidth / count;

  for (let i = 0; i < count; i++) {
    const url = svgPaths[Math.floor(Math.random() * svgPaths.length)];
    loadSvgVertices(url).then(vertices => {
      const scale = 0.7;
      const scaledVerts = vertices.map(v => ({ x: v.x * scale, y: v.y * scale }));
      const x = 50 + i * spacing;
      const y = window.innerHeight - 200 - Math.random() * 100;

      let body = Matter.Bodies.fromVertices(x, y, scaledVerts, {
        restitution: 0.5,
        render: {
          fillStyle: 'rgba(108, 27, 45, 1)',
          strokeStyle: '#6c1b2d',
          lineWidth: 1
        }
      }, true);

      if (!body && scaledVerts.length > 2) {
        const fallbackVerts = scaledVerts.map(v => ({ x: v.x * 0.7, y: v.y * 0.7 }));
        body = Matter.Bodies.fromVertices(x, y, fallbackVerts, {
          restitution: 0.5,
          render: {
            fillStyle: 'rgba(108, 27, 45, 1)',
            strokeStyle: '#6c1b2d',
            lineWidth: 1
          }
        }, true);
      }

      if (body) {
        body.label = 'svg-shape';
        body.customText = shapeTexts[Math.floor(Math.random() * shapeTexts.length)];
        Matter.World.add(engine.world, body);
        activeShapes.push(body);
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const openButton = document.getElementById('info-button');
  const closeButton = document.getElementById('close-sidebar');

  const openSidebar = () => {
    const sidebarWidth = sidebar.offsetWidth;
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
    sidebar.classList.add('open');
    sidebar.classList.remove('hidden');
    sidebar.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sidebar-open');
    sidebarIsOpen = true;
    
    const shift = -sidebar.offsetWidth;
    const effectiveWidthAfter = getEffectiveWidth();
    activeShapes.forEach(body => {
      if (body.position.x > effectiveWidthAfter) {
        Matter.Body.translate(body, { x: shift, y: 0 });
      }
    });
setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);
   const effectiveWidth = getEffectiveWidth();
const targetWallX = effectiveWidth + wallThickness / 2;
animateRightWallShift(targetWallX);
  };

  const closeSidebar = () => {
    document.documentElement.style.removeProperty('--sidebar-width');
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sidebar-open');
    sidebarIsOpen = false;
    
    const shift = sidebar.offsetWidth;
    const effectiveWidthBefore = getEffectiveWidth();
    setTimeout(() => {
      activeShapes.forEach(body => {
        if (body.position.x > effectiveWidthBefore) {
          Matter.Body.translate(body, { x: shift, y: 0 });
        }
      });
    }, 310);
setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);
    setTimeout(() => {
  const effectiveWidth = getEffectiveWidth();
  const targetWallX = effectiveWidth + wallThickness / 2;
  animateRightWallShift(targetWallX);
}, 310);
  };

  if (openButton && sidebar) {
    openButton.addEventListener('click', openSidebar);
  }
  if (closeButton) {
    closeButton.addEventListener('click', closeSidebar);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  document.addEventListener('click', (event) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !openButton.contains(event.target)) {
      closeSidebar();
    }
  });
});

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

  updateRightWall();
});


// import './pathseg.js';
import './src/lib/pathseg.js';
import Matter from 'matter-js';
import decomp from 'poly-decomp';





// Workaround, damit es nicht aus dem Build fliegt:
if (typeof window.SVGPathSeg === 'undefined') {
  console.warn('pathseg not loaded correctly');
}

window.decomp = decomp;
Matter.Common.setDecomp(decomp);

const {
  Engine, Render, Runner, World, Bodies, Body, Svg, Mouse, MouseConstraint, Events,  Composite
} = Matter;


const engine = Engine.create();
const world = engine.world;
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





const svgPaths = import.meta.env.DEV
  ? [
      '/assets/svgShapes/shape1.svg',
      '/assets/svgShapes/shape2.svg',
      '/assets/svgShapes/shape3.svg',
      '/assets/svgShapes/shape4.svg'
    ]
  : [
      new URL('./svgShapes/shape1.svg', import.meta.url).href,
      new URL('./svgShapes/shape2.svg', import.meta.url).href,
      new URL('./svgShapes/shape3.svg', import.meta.url).href,
      new URL('./svgShapes/shape4.svg', import.meta.url).href
    ];
const activeShapes = [];

const isMobile = window.innerWidth < 600;

let maxShapes;
if (isMobile) {
  maxShapes = 10;
} else if (window.innerWidth < 1024) {
  maxShapes = 10; // kleines Notebook oder Tablet im Querformat
} else if (window.innerWidth < 1440) {
  maxShapes = 16; // normaler Laptop oder Desktop
} else if (window.innerWidth < 1800) {
  maxShapes = 22; // normaler Laptop oder Desktop
} else {
  maxShapes = 50; // großer Bildschirm
}

async function loadSvgVertices(url) {
  const res = await fetch(url);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const path = doc.querySelector('path');
  return Svg.pathToVertices(path, 30);
}

const shapeTexts = ['Treffpunkt', 'Museum', 'Kultur', 'Ausstellung', 'Vermietung', 'Workshops', 'Restaurant', 'Jung & Alt'];

async function spawnSvgShape() {
  if (activeShapes.length >= maxShapes) return;

  const url = svgPaths[Math.floor(Math.random() * svgPaths.length)];
  const vertices = await loadSvgVertices(url);
  const scale = isMobile ? 0.5 : 0.8;

  const scaledVerts = vertices.map(v => ({
    x: v.x * scale,
    y: v.y * scale
  }));

  let body = Bodies.fromVertices(
    Math.random() * window.innerWidth,
    -100,
    scaledVerts,
    {
      restitution: 0.5,
      render: {
        fillStyle: '#6c1b2d',
        strokeStyle: '#6c1b2d',
        lineWidth: 1
      }
    },
    true
  );

  // Fallback bei fehlerhaften Vertices
  if (!body && scaledVerts.length > 2) {
    const fallbackVerts = scaledVerts.map(v => ({
      x: v.x * 0.7,
      y: v.y * 0.7
    }));

    body = Bodies.fromVertices(
      Math.random() * window.innerWidth,
      -100,
      fallbackVerts,
      {
        restitution: 0.5,
        render: {
          fillStyle: '#6c1b2d',
          strokeStyle: '#6c1b2d',
          lineWidth: 1
        }
      },
      true
    );
  }

  // Endgültige Prüfung und Konfiguration
  if (!body) {
    console.warn("Body konnte nicht erzeugt werden", vertices);
    return;
  }

  // 🏷️ Shape-Label und Textzuweisung
  body.label = 'svg-shape';
// 🎲 Zufällig entscheiden, ob dieser Shape Text bekommt
if (Math.random() < 0.4) {
  body.customText = shapeTexts[Math.floor(Math.random() * shapeTexts.length)];
}
  World.add(engine.world, body);
  activeShapes.push(body);

  // 🕒 Despawn auf Mobile
  // if (isMobile) {
  //   setTimeout(() => {
  //     World.remove(engine.world, body);
  //     const index = activeShapes.indexOf(body);
  //     if (index > -1) activeShapes.splice(index, 1);

  //     spawnSvgShape();
  //   }, 12000);
  // }
}

if (!isMobile) {
  console.warn('▶️ spawnInitialShapes gestartet');
  spawnInitialShapes(10); // Anzahl kannst du anpassen
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




// Mouse hinzufügen
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: { visible: false }
  }
});


//click to despwan

World.add(world, mouseConstraint);
render.mouse = mouse;


let dragStartPos = null;
let dragged = false;

Events.on(mouseConstraint, 'mousedown', function(event) {
  dragStartPos = { x: event.mouse.position.x, y: event.mouse.position.y };
  dragged = false;
});

Events.on(mouseConstraint, 'mousemove', function(event) {
  if (!dragStartPos) return;

  const dx = event.mouse.position.x - dragStartPos.x;
  const dy = event.mouse.position.y - dragStartPos.y;

  if (Math.sqrt(dx * dx + dy * dy) > 5) {
    dragged = true;
  }
});

Events.on(mouseConstraint, 'mouseup', function(event) {
  if (dragged) return; // keine Aktion bei Drag

  const mousePosition = event.mouse.position;
  const clickedBodies = Matter.Query.point(Composite.allBodies(world), mousePosition);

  if (clickedBodies.length > 0) {
    const body = clickedBodies[0];

    if (body.label === 'svg-shape') {
      World.remove(world, body);

      const index = activeShapes.indexOf(body);
      if (index > -1) activeShapes.splice(index, 1);

      spawnSvgShape();
    }
  }

  // Reset
  dragStartPos = null;
  dragged = false;
});




//Text auf Frucht

// Events.on(render, 'afterRender', () => {
//   // console.log('🖌️ afterRender läuft'); // ← Debug-Ausgabe
//   const context = render.context;
//   const bodies = Composite.allBodies(engine.world);

//   context.save();

//   for (const body of bodies) {
//     if (body.label === 'svg-shape' && body.customText) {
//       // console.log('label:', body.label, 'customText:', body.customText);
//       const x = body.position.x;
//       const y = body.position.y;
//       const angle = body.angle;

//       context.save();
//       context.translate(x, y);
//       context.rotate(angle);

//       // ✏️ Text vorbereiten
//       const text = body.customText.toUpperCase();
//       const fontSize = 18;
//       const padding = 10;

//       context.font = `${fontSize}px sans-serif`;
//       context.textAlign = 'center';
//       context.textBaseline = 'middle';

//       const textWidth = context.measureText(text).width;
//       const bgWidth = textWidth + padding * 2;
//       const bgHeight = fontSize + padding;

//       // 🪶 Hintergrund hinter dem Text
//       context.fillStyle = 'rgba(228, 0, 76, 1.0)';
//       context.fillRect(
//         -bgWidth / 2,
//         -bgHeight / 2,
//         bgWidth,
//         bgHeight
//       );

//       // 🎨 Text
//       context.fillStyle = 'rgba(108, 27, 45, 1.0)';
//       context.fillText(text, 0, 0);

//       context.restore();
//     }
//   }

//   context.restore();
// });



// ⏳ Canvas-Fade-in nach kurzer Verzögerung
window.addEventListener('load', () => {
  setTimeout(() => {
    canvas.style.opacity = '1';
    canvas.style.backgroundColor = '#e4004c'; // optionaler Farbübergang
  }, 1000); // Zeit in Millisekunden
});

//Scrollen auch auf Canvas ermöglichen
document.getElementById('bg').addEventListener('wheel', (e) => {
  window.scrollBy(0, e.deltaY);
});


//Button Overlay
      window.addEventListener('DOMContentLoaded', () => {
        const overlay = document.getElementById('info-overlay');
        const content = document.querySelector('.info-content');
        const button = document.getElementById('info-button');
        const closeBtn = document.getElementById('close-overlay');

        const closeOverlay = () => {
  button.focus();
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
};

        if (button && overlay && content) {
          button.addEventListener('click', () => {
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    closeBtn.focus();
  });
});

          overlay.addEventListener('click', (event) => {
            if (!content.contains(event.target)) {
              closeOverlay();
            }
          });
        }

        if (closeBtn) {
          closeBtn.addEventListener('click', closeOverlay);
        }

        // ESC-Taste zum Schließen des Overlays
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeOverlay();
          }
        });
      });