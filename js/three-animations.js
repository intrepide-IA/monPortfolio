// three-animations.js - Gestion de toutes les animations Three.js

function initThreeAnimations() {
    // ========== TORUS (Hero Section) ==========
    const torusCanvas = document.getElementById('torusCanvas');
    if (!torusCanvas) return console.warn('torusCanvas not found');
    
    const torusScene = new THREE.Scene();
    const torusCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const torusRenderer = new THREE.WebGLRenderer({
        canvas: torusCanvas,
        alpha: true,
        antialias: true
    });

    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({
        color: 0x5773ff,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torusScene.add(torus);
    torusCamera.position.z = 3;

    // ========== CUBE (Hero Section) ==========
    const cubeCanvas = document.getElementById('cubeCanvas');
    const cubeScene = new THREE.Scene();
    const cubeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const cubeRenderer = new THREE.WebGLRenderer({
        canvas: cubeCanvas,
        alpha: true,
        antialias: true
    });

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff007a,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeScene.add(cube);
    cubeCamera.position.z = 3;

    // ========== PYRAMID (Hero Section) ==========
    const pyramidCanvas = document.getElementById('pyramidCanvas');
    const pyramidScene = new THREE.Scene();
    const pyramidCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const pyramidRenderer = new THREE.WebGLRenderer({
        canvas: pyramidCanvas,
        alpha: true,
        antialias: true
    });

    const pyramidGeometry = new THREE.ConeGeometry(0.8, 1.5, 4);
    const pyramidMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
    pyramid.rotation.y = Math.PI / 4;
    pyramidScene.add(pyramid);
    pyramidCamera.position.z = 3;

    // ========== TECH VIZ CANVAS (Background principal) ==========
    const techVizCanvas = document.getElementById('techVizCanvas');
    const techVizScene = new THREE.Scene();
    const techVizCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const techVizRenderer = new THREE.WebGLRenderer({
        canvas: techVizCanvas,
        alpha: true,
        antialias: true
    });

    const techVizParticles = 500;
    const techVizPositions = new Float32Array(techVizParticles * 3);
    const techVizColors = new Float32Array(techVizParticles * 3);

    for (let i = 0; i < techVizParticles; i++) {
        techVizPositions[i * 3] = (Math.random() - 0.5) * 10;
        techVizPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        techVizPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        techVizColors[i * 3] = Math.random() * 0.5 + 0.5;
        techVizColors[i * 3 + 1] = Math.random() * 0.3;
        techVizColors[i * 3 + 2] = Math.random() * 0.5 + 0.5;
    }

    const techVizGeometry = new THREE.BufferGeometry();
    techVizGeometry.setAttribute('position', new THREE.BufferAttribute(techVizPositions, 3));
    techVizGeometry.setAttribute('color', new THREE.BufferAttribute(techVizColors, 3));

    const techVizMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const techVizParticleSystem = new THREE.Points(techVizGeometry, techVizMaterial);
    techVizScene.add(techVizParticleSystem);
    techVizCamera.position.z = 5;

    // ========== TECH VIZ CANVAS 2 (Section Compétences) ==========
    const techVizCanvas2 = document.getElementById('techVizCanvas2');
    let techVizScene2, techVizCamera2, techVizRenderer2, techVizParticleSystem2;
    
    if (techVizCanvas2) {
        techVizScene2 = new THREE.Scene();
        techVizCamera2 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        techVizRenderer2 = new THREE.WebGLRenderer({
            canvas: techVizCanvas2,
            alpha: true,
            antialias: true
        });

        const techVizParticles2 = 500;
        const techVizPositions2 = new Float32Array(techVizParticles2 * 3);
        const techVizColors2 = new Float32Array(techVizParticles2 * 3);

        for (let i = 0; i < techVizParticles2; i++) {
            techVizPositions2[i * 3] = (Math.random() - 0.5) * 10;
            techVizPositions2[i * 3 + 1] = (Math.random() - 0.5) * 10;
            techVizPositions2[i * 3 + 2] = (Math.random() - 0.5) * 10;

            techVizColors2[i * 3] = Math.random() * 0.5 + 0.5;
            techVizColors2[i * 3 + 1] = Math.random() * 0.3;
            techVizColors2[i * 3 + 2] = Math.random() * 0.5 + 0.5;
        }

        const techVizGeometry2 = new THREE.BufferGeometry();
        techVizGeometry2.setAttribute('position', new THREE.BufferAttribute(techVizPositions2, 3));
        techVizGeometry2.setAttribute('color', new THREE.BufferAttribute(techVizColors2, 3));

        const techVizMaterial2 = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        techVizParticleSystem2 = new THREE.Points(techVizGeometry2, techVizMaterial2);
        techVizScene2.add(techVizParticleSystem2);
        techVizCamera2.position.z = 5;
    }

    // ========== STATS CANVAS ==========
    const statsCanvas = document.getElementById('statsCanvas');
    let statsScene, statsCamera, statsRenderer, statsGroup;
    
    if (statsCanvas) {
        statsScene = new THREE.Scene();
        statsCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        statsRenderer = new THREE.WebGLRenderer({
            canvas: statsCanvas,
            alpha: true,
            antialias: true
        });

        statsGroup = new THREE.Group();

        const barHeights = [1.5, 2, 2.8, 1.8, 2.5];
        const barColors = [0x00f0ff, 0x5773ff, 0xff007a, 0x8a2be2, 0x00ffaa];

        for (let i = 0; i < barHeights.length; i++) {
            const barGeometry = new THREE.BoxGeometry(0.3, barHeights[i], 0.3);
            const barMaterial = new THREE.MeshBasicMaterial({ color: barColors[i] });
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.x = (i - 2) * 0.8;
            bar.position.y = barHeights[i] / 2;
            statsGroup.add(bar);

            if (i > 0) {
                const lineGeometry = new THREE.BufferGeometry();
                const lineVertices = [
                    (i - 1 - 2) * 0.8, barHeights[i - 1], 0,
                    (i - 2) * 0.8, barHeights[i], 0
                ];
                lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.4
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                statsGroup.add(line);
            }
        }

        const planeGeometry = new THREE.PlaneGeometry(5, 0.1);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = Math.PI / 2;
        plane.position.y = -0.05;
        statsGroup.add(plane);

        statsScene.add(statsGroup);
        statsCamera.position.z = 6;
        statsCamera.position.y = 1;
        statsCamera.lookAt(0, 1, 0);
    }

    // ========== FOOTER SPHERE ==========
    const footerSphereCanvas = document.getElementById('footerSphereCanvas');
    let footerSphereScene, footerSphereCamera, footerSphereRenderer, footerSphere;
    
    if (footerSphereCanvas) {
        footerSphereScene = new THREE.Scene();
        footerSphereCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        footerSphereRenderer = new THREE.WebGLRenderer({
            canvas: footerSphereCanvas,
            alpha: true,
            antialias: true
        });

        const footerSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const footerSphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        footerSphere = new THREE.Mesh(footerSphereGeometry, footerSphereMaterial);
        footerSphereScene.add(footerSphere);
        footerSphereCamera.position.z = 3;
    }

    // ========== ANIMATION LOOP ==========
    function animate() {
        requestAnimationFrame(animate);

        // Rotate torus
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.01;
        torusRenderer.render(torusScene, torusCamera);

        // Rotate cube
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
        cubeRenderer.render(cubeScene, cubeCamera);

        // Rotate pyramid
        pyramid.rotation.x += 0.007;
        pyramid.rotation.z += 0.007;
        pyramidRenderer.render(pyramidScene, pyramidCamera);

        // Animate tech viz particles
        techVizParticleSystem.rotation.y += 0.003;
        techVizRenderer.render(techVizScene, techVizCamera);

        // Animate tech viz particles 2
        if (techVizParticleSystem2) {
            techVizParticleSystem2.rotation.y += 0.003;
            techVizRenderer2.render(techVizScene2, techVizCamera2);
        }

        // Animate stats bars
        if (statsGroup) {
            statsGroup.rotation.y += 0.002;
            statsRenderer.render(statsScene, statsCamera);
        }

        // Rotate footer sphere
        if (footerSphere) {
            footerSphere.rotation.y += 0.01;
            footerSphereRenderer.render(footerSphereScene, footerSphereCamera);
        }
    }

    animate();

    // ========== HANDLE WINDOW RESIZE ==========
    window.addEventListener('resize', function () {
        const canvases = [
            { canvas: torusCanvas, renderer: torusRenderer, camera: torusCamera },
            { canvas: cubeCanvas, renderer: cubeRenderer, camera: cubeCamera },
            { canvas: pyramidCanvas, renderer: pyramidRenderer, camera: pyramidCamera },
            { canvas: techVizCanvas, renderer: techVizRenderer, camera: techVizCamera }
        ];

        if (techVizCanvas2) {
            canvases.push({ canvas: techVizCanvas2, renderer: techVizRenderer2, camera: techVizCamera2 });
        }
        if (statsCanvas) {
            canvases.push({ canvas: statsCanvas, renderer: statsRenderer, camera: statsCamera });
        }
        if (footerSphereCanvas) {
            canvases.push({ canvas: footerSphereCanvas, renderer: footerSphereRenderer, camera: footerSphereCamera });
        }

        canvases.forEach(item => {
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
    window.dispatchEvent(new Event('resize'));

    console.log('✅ Three.js animations initialized');
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initThreeAnimations };
}