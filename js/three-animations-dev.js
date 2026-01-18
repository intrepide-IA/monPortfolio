// three-animations-dev.js - Animations Three.js pour le profil Développeur Frontend

function initThreeAnimations() {
  // Helper function pour setup les canvases avec taille correcte
  function setupCanvas(canvas, renderer, camera) {
    if (!canvas || !canvas.parentElement) return false;

    const parent = canvas.parentElement;
    const width = parent.offsetWidth || 1;
    const height = parent.offsetHeight || 1;

    canvas.width = width;
    canvas.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    return true;
  }

  // ========== CODE CUBE - Hero Section (Remplace Torus) ==========
  const torusCanvas = document.getElementById("torusCanvas");
  if (!torusCanvas) return console.warn("torusCanvas not found");

  const torusScene = new THREE.Scene();
  const torusCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const torusRenderer = new THREE.WebGLRenderer({
    canvas: torusCanvas,
    alpha: true,
    antialias: true,
  });
  setupCanvas(torusCanvas, torusRenderer, torusCamera);

  // Cube avec effet de code/debug - géométrie tech
  const torusGeometry = new THREE.TetrahedronGeometry(1, 2);
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.95,
  });
  const torus = new THREE.Mesh(torusGeometry, torusMaterial);
  torusScene.add(torus);
  torusCamera.position.z = 3;

  // ========== OCTAHEDRON (Hero Section - Remplace Cube) ==========
  const cubeCanvas = document.getElementById("cubeCanvas");
  const cubeScene = new THREE.Scene();
  const cubeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const cubeRenderer = new THREE.WebGLRenderer({
    canvas: cubeCanvas,
    alpha: true,
    antialias: true,
  });
  setupCanvas(cubeCanvas, cubeRenderer, cubeCamera);

  const cubeGeometry = new THREE.DodecahedronGeometry(0.9, 0);
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cubeScene.add(cube);
  cubeCamera.position.z = 3;

  // ========== ICOSAHEDRON (Hero Section - Remplace Pyramid) ==========
  const pyramidCanvas = document.getElementById("pyramidCanvas");
  const pyramidScene = new THREE.Scene();
  const pyramidCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const pyramidRenderer = new THREE.WebGLRenderer({
    canvas: pyramidCanvas,
    alpha: true,
    antialias: true,
  });
  setupCanvas(pyramidCanvas, pyramidRenderer, pyramidCamera);

  const pyramidGeometry = new THREE.TorusGeometry(0.7, 0.25, 8, 16);
  const pyramidMaterial = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    wireframe: true,
    transparent: true,
    opacity: 0.9,
  });
  const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
  pyramidScene.add(pyramid);
  pyramidCamera.position.z = 3;

  // ========== TECH VIZ CANVAS - Code Flow Particles (Background principal) ==========
  const techVizCanvas = document.getElementById("techVizCanvas");
  const techVizScene = new THREE.Scene();
  const techVizCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const techVizRenderer = new THREE.WebGLRenderer({
    canvas: techVizCanvas,
    alpha: true,
    antialias: true,
  });
  setupCanvas(techVizCanvas, techVizRenderer, techVizCamera);

  // Plus de particules pour un effet plus intense
  const techVizParticles = 800;
  const techVizPositions = new Float32Array(techVizParticles * 3);
  const techVizColors = new Float32Array(techVizParticles * 3);
  const velocities = new Float32Array(techVizParticles * 3);

  for (let i = 0; i < techVizParticles; i++) {
    techVizPositions[i * 3] = (Math.random() - 0.5) * 15;
    techVizPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
    techVizPositions[i * 3 + 2] = (Math.random() - 0.5) * 15;

    // Couleurs tech: cyan, blue, purple (pas de green)
    const colorChoice = Math.floor(Math.random() * 3);
    if (colorChoice === 0) {
      // Cyan
      techVizColors[i * 3] = 0.05;
      techVizColors[i * 3 + 1] = 0.95;
      techVizColors[i * 3 + 2] = 0.95;
    } else if (colorChoice === 1) {
      // Blue
      techVizColors[i * 3] = 0.2;
      techVizColors[i * 3 + 1] = 0.5;
      techVizColors[i * 3 + 2] = 0.98;
    } else {
      // Violet/Purple
      techVizColors[i * 3] = 0.6;
      techVizColors[i * 3 + 1] = 0.35;
      techVizColors[i * 3 + 2] = 1.0;
    }

    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  const techVizGeometry = new THREE.BufferGeometry();
  techVizGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(techVizPositions, 3),
  );
  techVizGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(techVizColors, 3),
  );

  const techVizMaterial = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  const techVizParticleSystem = new THREE.Points(
    techVizGeometry,
    techVizMaterial,
  );
  techVizScene.add(techVizParticleSystem);
  techVizCamera.position.z = 8;

  // ========== TECH VIZ CANVAS 2 - Code Network (Section Compétences) ==========
  const techVizCanvas2 = document.getElementById("techVizCanvas2");
  let techVizScene2, techVizCamera2, techVizRenderer2, techVizParticleSystem2;

  if (techVizCanvas2) {
    techVizScene2 = new THREE.Scene();
    techVizCamera2 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    techVizRenderer2 = new THREE.WebGLRenderer({
      canvas: techVizCanvas2,
      alpha: true,
      antialias: true,
    });
    setupCanvas(techVizCanvas2, techVizRenderer2, techVizCamera2);

    const techVizParticles2 = 600;
    const techVizPositions2 = new Float32Array(techVizParticles2 * 3);
    const techVizColors2 = new Float32Array(techVizParticles2 * 3);

    for (let i = 0; i < techVizParticles2; i++) {
      techVizPositions2[i * 3] = (Math.random() - 0.5) * 15;
      techVizPositions2[i * 3 + 1] = (Math.random() - 0.5) * 15;
      techVizPositions2[i * 3 + 2] = (Math.random() - 0.5) * 15;

      // Couleurs tech neon
      const colorChoice = Math.floor(Math.random() * 3);
      if (colorChoice === 0) {
        techVizColors2[i * 3] = 0.0;
        techVizColors2[i * 3 + 1] = 0.95;
        techVizColors2[i * 3 + 2] = 0.9;
      } else if (colorChoice === 1) {
        techVizColors2[i * 3] = 0.3;
        techVizColors2[i * 3 + 1] = 0.3;
        techVizColors2[i * 3 + 2] = 0.95;
      } else {
        techVizColors2[i * 3] = 0.6;
        techVizColors2[i * 3 + 1] = 0.2;
        techVizColors2[i * 3 + 2] = 0.95;
      }
    }

    const techVizGeometry2 = new THREE.BufferGeometry();
    techVizGeometry2.setAttribute(
      "position",
      new THREE.BufferAttribute(techVizPositions2, 3),
    );
    techVizGeometry2.setAttribute(
      "color",
      new THREE.BufferAttribute(techVizColors2, 3),
    );

    const techVizMaterial2 = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    techVizParticleSystem2 = new THREE.Points(
      techVizGeometry2,
      techVizMaterial2,
    );
    techVizScene2.add(techVizParticleSystem2);
    techVizCamera2.position.z = 8;
  }

  // ========== STATS CANVAS - Performance Bars ==========
  const statsCanvas = document.getElementById("statsCanvas");
  let statsScene, statsCamera, statsRenderer, statsGroup;
  let statsBars = [];

  if (statsCanvas) {
    statsScene = new THREE.Scene();
    statsCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    statsRenderer = new THREE.WebGLRenderer({
      canvas: statsCanvas,
      alpha: true,
      antialias: true,
    });
    setupCanvas(statsCanvas, statsRenderer, statsCamera);

    statsGroup = new THREE.Group();

    // Barres représentant les compétences tech
    const barHeights = [2.2, 2.5, 2.8, 2.1, 2.4];
    const barColors = [0x3b82f6, 0x8b5cf6, 0x06b6d4, 0x3b82f6, 0x8b5cf6];
    const barLabels = ["React", "TypeScript", "Next.js", "Tailwind", "Mobile"];

    for (let i = 0; i < barHeights.length; i++) {
      const barGeometry = new THREE.BoxGeometry(0.35, barHeights[i], 0.35);
      const barMaterial = new THREE.MeshBasicMaterial({
        color: barColors[i],
        wireframe: false,
      });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.x = (i - 2) * 0.95;
      bar.position.y = barHeights[i] / 2;
      bar.originalHeight = barHeights[i];
      bar.barIndex = i;
      statsGroup.add(bar);
      statsBars.push(bar);

      // Lignes de connexion
      if (i > 0) {
        const lineGeometry = new THREE.BufferGeometry();
        const lineVertices = [
          (i - 1 - 2) * 0.95,
          barHeights[i - 1],
          0,
          (i - 2) * 0.95,
          barHeights[i],
          0,
        ];
        lineGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(lineVertices, 3),
        );
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.6,
          linewidth: 2,
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        statsGroup.add(line);
      }
    }

    // Base de la grille
    const planeGeometry = new THREE.PlaneGeometry(5, 0.08);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -0.05;
    statsGroup.add(plane);

    statsScene.add(statsGroup);
    statsCamera.position.z = 7;
    statsCamera.position.y = 1.2;
    statsCamera.lookAt(0, 1, 0);
  }

  // ========== FOOTER SPHERE - Rotating Tech Sphere ==========
  const footerSphereCanvas = document.getElementById("footerSphereCanvas");
  let footerSphereScene, footerSphereCamera, footerSphereRenderer, footerSphere;

  if (footerSphereCanvas) {
    footerSphereScene = new THREE.Scene();
    footerSphereCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    footerSphereRenderer = new THREE.WebGLRenderer({
      canvas: footerSphereCanvas,
      alpha: true,
      antialias: true,
    });
    setupCanvas(footerSphereCanvas, footerSphereRenderer, footerSphereCamera);

    // Octahedron complexe pour un effet plus tech
    const footerSphereGeometry = new THREE.OctahedronGeometry(1, 3);
    const footerSphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    footerSphere = new THREE.Mesh(footerSphereGeometry, footerSphereMaterial);
    footerSphereScene.add(footerSphere);
    footerSphereCamera.position.z = 3;
  }

  // ========== ANIMATION LOOP ==========
  function animate() {
    requestAnimationFrame(animate);

    // Tetrahedron - Rotation rapide et tech
    torus.rotation.x += 0.025;
    torus.rotation.y += 0.018;
    torus.rotation.z += 0.012;
    // Pulsation d'échelle
    const torusPulse = 1 + Math.sin(Date.now() * 0.002) * 0.1;
    torus.scale.set(torusPulse, torusPulse, torusPulse);
    torusRenderer.render(torusScene, torusCamera);

    // Dodecahedron - Rotation équilibrée
    cube.rotation.x += 0.018;
    cube.rotation.y += 0.022;
    cube.rotation.z += 0.008;
    // Pulsation d'échelle inverse
    const cubePulse = 1 + Math.cos(Date.now() * 0.002) * 0.08;
    cube.scale.set(cubePulse, cubePulse, cubePulse);
    cubeRenderer.render(cubeScene, cubeCamera);

    // Torus - Rotation lente et fluide
    pyramid.rotation.x += 0.008;
    pyramid.rotation.y += 0.015;
    pyramid.rotation.z += 0.018;
    // Pulsation d'échelle avec phase décalée
    const pyramidPulse = 1 + Math.sin(Date.now() * 0.0025 + Math.PI / 2) * 0.12;
    pyramid.scale.set(pyramidPulse, pyramidPulse, pyramidPulse);
    pyramidRenderer.render(pyramidScene, pyramidCamera);

    // Animate code flow particles avec mouvement
    techVizParticleSystem.rotation.y += 0.005;
    techVizParticleSystem.rotation.x += 0.002;

    techVizRenderer.render(techVizScene, techVizCamera);

    // Animate code network particles
    if (techVizParticleSystem2) {
      techVizParticleSystem2.rotation.y += 0.004;
      techVizParticleSystem2.rotation.z += 0.003;
      techVizRenderer2.render(techVizScene2, techVizCamera2);
    }

    // Animate performance bars avec pulsation
    if (statsGroup) {
      statsGroup.rotation.y += 0.003;
      
      // Animer les barres avec une pulsation
      statsBars.forEach((bar, index) => {
        const time = Date.now() * 0.001;
        const delay = index * 0.2;
        const pulsation = 1 + Math.sin(time + delay) * 0.15;
        bar.scale.y = pulsation;
        bar.position.y = (bar.originalHeight / 2) * pulsation;
      });
      
      statsRenderer.render(statsScene, statsCamera);
    }

    // Rotate tech sphere avec pulsation
    if (footerSphere) {
      footerSphere.rotation.x += 0.008;
      footerSphere.rotation.y += 0.016;
      footerSphere.rotation.z += 0.006;
      
      // Ajouter une pulsation
      const footerPulse = 1 + Math.sin(Date.now() * 0.0015) * 0.1;
      footerSphere.scale.set(footerPulse, footerPulse, footerPulse);
      
      footerSphereRenderer.render(footerSphereScene, footerSphereCamera);
    }
  }

  animate();

  // ========== HANDLE WINDOW RESIZE ==========
  window.addEventListener("resize", function () {
    const canvases = [
      { canvas: torusCanvas, renderer: torusRenderer, camera: torusCamera },
      { canvas: cubeCanvas, renderer: cubeRenderer, camera: cubeCamera },
      {
        canvas: pyramidCanvas,
        renderer: pyramidRenderer,
        camera: pyramidCamera,
      },
      {
        canvas: techVizCanvas,
        renderer: techVizRenderer,
        camera: techVizCamera,
      },
    ];

    if (techVizCanvas2) {
      canvases.push({
        canvas: techVizCanvas2,
        renderer: techVizRenderer2,
        camera: techVizCamera2,
      });
    }
    if (statsCanvas) {
      canvases.push({
        canvas: statsCanvas,
        renderer: statsRenderer,
        camera: statsCamera,
      });
    }
    if (footerSphereCanvas) {
      canvases.push({
        canvas: footerSphereCanvas,
        renderer: footerSphereRenderer,
        camera: footerSphereCamera,
      });
    }

    canvases.forEach((item) => {
      if (item.canvas && item.canvas.parentElement) {
        const parent = item.canvas.parentElement;
        const width = parent.offsetWidth;
        const height = parent.offsetHeight;

        if (width > 0 && height > 0) {
          item.canvas.width = width;
          item.canvas.height = height;
          item.renderer.setSize(width, height);
          item.camera.aspect = width / height;
          item.camera.updateProjectionMatrix();
        }
      }
    });
  });

  // Trigger initial resize
  window.dispatchEvent(new Event("resize"));

  console.log("✅ Three.js Developer Animations initialized");
}

// Export pour utilisation globale
if (typeof module !== "undefined" && module.exports) {
  module.exports = { initThreeAnimations };
}
