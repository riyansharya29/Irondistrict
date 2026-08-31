/* =========================================================
   IRON DISTRICT — 3D Scene + Interactions
   ========================================================= */

(function() {
  'use strict';

  // === LOADER ===
  const loader = document.getElementById('loader');
  const loaderPercent = document.getElementById('loaderPercent');
  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 14 + 4;
    if (progress >= 100) { progress = 100; clearInterval(loaderInterval); }
    loaderPercent.textContent = Math.floor(progress) + '%';
    if (progress >= 100) {
      setTimeout(() => {
        loader.classList.add('done');
        document.body.style.overflow = '';
      }, 350);
    }
  }, 90);
  document.body.style.overflow = 'hidden';

  // === THREE.JS HERO SCENE ===
  const initHero3D = () => {
    const container = document.getElementById('hero3d');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0b, 0.045);

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 0.5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // === LIGHTING ===
    const ambient = new THREE.AmbientLight(0x2a2a30, 0.6);
    scene.add(ambient);

    const keyLight = new THREE.SpotLight(0xffffff, 4, 60, Math.PI / 6, 0.6, 1.2);
    keyLight.position.set(8, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.SpotLight(0xe8ff3a, 6, 40, Math.PI / 5, 0.5, 1.5);
    rimLight.position.set(-10, 4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x6688ff, 1.2, 30);
    fillLight.position.set(-5, -2, 6);
    scene.add(fillLight);

    const topLight = new THREE.PointLight(0xffffff, 1.5, 20);
    topLight.position.set(0, 8, 0);
    scene.add(topLight);

    // === MATERIALS ===
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xb8b8c0,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.2
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1f,
      metalness: 0.9,
      roughness: 0.3
    });
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.1,
      roughness: 0.95
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xe8ff3a,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0xe8ff3a,
      emissiveIntensity: 0.3
    });

    const equipment = [];
    const floatingMetals = [];

    // === DUMBBELL FACTORY ===
    const createDumbbell = (scale = 1) => {
      const group = new THREE.Group();
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.6, 24),
        chromeMat
      );
      bar.rotation.z = Math.PI / 2;
      bar.castShadow = true;
      group.add(bar);

      const plateGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.18, 32);
      const positions = [-0.95, 0.95];
      positions.forEach(x => {
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 24), rubberMat);
        inner.rotation.z = Math.PI / 2;
        inner.position.x = x;
        group.add(inner);
        for (let i = 0; i < 3; i++) {
          const plate = new THREE.Mesh(plateGeo, [darkMetalMat, chromeMat, accentMat][i % 3]);
          plate.rotation.z = Math.PI / 2;
          plate.position.x = x + (x > 0 ? i * 0.22 : -i * 0.22);
          plate.castShadow = true;
          group.add(plate);
        }
      });
      group.scale.setScalar(scale);
      return group;
    };

    // === BARBELL FACTORY ===
    const createBarbell = () => {
      const group = new THREE.Group();
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 4.2, 24),
        chromeMat
      );
      bar.rotation.z = Math.PI / 2;
      bar.castShadow = true;
      group.add(bar);
      const plateGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.2, 32);
      [-1.5, 1.5].forEach(x => {
        for (let i = 0; i < 4; i++) {
          const plate = new THREE.Mesh(plateGeo, i === 3 ? accentMat : darkMetalMat);
          plate.rotation.z = Math.PI / 2;
          plate.position.x = x + (x > 0 ? i * 0.24 : -i * 0.24);
          plate.castShadow = true;
          group.add(plate);
        }
      });
      return group;
    };

    // === KETTLEBELL FACTORY ===
    const createKettlebell = () => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.75),
        darkMetalMat
      );
      body.castShadow = true;
      group.add(body);
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.06, 16, 32),
        chromeMat
      );
      handle.position.y = 0.4;
      handle.rotation.x = Math.PI / 2;
      handle.castShadow = true;
      group.add(handle);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 0.15, 24),
        darkMetalMat
      );
      base.position.y = -0.35;
      base.castShadow = true;
      group.add(base);
      return group;
    };

    // === FLOATING METALLIC SHAPES ===
    const createFloatingShape = (type) => {
      let mesh;
      if (type === 'torus') mesh = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.15, 16, 32), chromeMat);
      else if (type === 'icosa') mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), chromeMat);
      else if (type === 'octa') mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), accentMat);
      else mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), darkMetalMat);
      mesh.castShadow = true;
      return mesh;
    };

    // === PLACE EQUIPMENT ===
    const positions = [
      { obj: createDumbbell(0.9), pos: [-6, 1, -2], rot: [0.3, 0.5, 0.2], float: 0.4, rotSpeed: 0.3 },
      { obj: createDumbbell(1.1), pos: [6.5, -1, -3], rot: [-0.2, -0.4, 0.6], float: 0.5, rotSpeed: -0.4 },
      { obj: createBarbell(), pos: [-4, -2.5, 2], rot: [0, 0.3, 0.1], float: 0.3, rotSpeed: 0.2 },
      { obj: createBarbell(), pos: [5, 2.5, -4], rot: [0, -0.5, 0], float: 0.6, rotSpeed: -0.25 },
      { obj: createKettlebell(), pos: [-3, -3, -3], rot: [0.2, 0.1, 0], float: 0.35, rotSpeed: 0.5 },
      { obj: createKettlebell(), pos: [3, 3.2, 2], rot: [-0.1, 0.3, 0.2], float: 0.4, rotSpeed: -0.45 },
      { obj: createDumbbell(0.6), pos: [-7, -0.5, 1], rot: [0.5, 0, 0.3], float: 0.5, rotSpeed: 0.6 },
      { obj: createDumbbell(0.7), pos: [7, 0.5, 0], rot: [-0.4, 0.2, 0.5], float: 0.45, rotSpeed: -0.55 }
    ];

    positions.forEach(p => {
      p.obj.position.set(...p.pos);
      p.obj.rotation.set(...p.rot);
      p.obj.userData = { baseY: p.pos[1], baseRot: p.rot, floatAmp: p.float, rotSpeed: p.rotSpeed, initial: p.pos };
      scene.add(p.obj);
      equipment.push(p.obj);
    });

    // Floating shapes
    const shapes = ['torus', 'icosa', 'octa', 'dodeca', 'torus', 'icosa'];
    shapes.forEach((s, i) => {
      const shape = createFloatingShape(s);
      const angle = (i / shapes.length) * Math.PI * 2;
      const radius = 4 + Math.random() * 3;
      shape.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius - 2);
      shape.userData = {
        baseY: shape.position.y,
        angle: angle,
        radius: radius,
        speed: 0.0003 + Math.random() * 0.0003,
        rotSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01, z: (Math.random() - 0.5) * 0.01 }
      };
      scene.add(shape);
      floatingMetals.push(shape);
    });

    // === PARTICLES ===
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const positionsArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positionsArr[i * 3] = (Math.random() - 0.5) * 30;
      positionsArr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positionsArr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positionsArr, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe8ff3a,
      size: 0.03,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // === FLOOR (subtle reflective disc) ===
    const floorGeo = new THREE.CircleGeometry(15, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0e0e12,
      metalness: 0.8,
      roughness: 0.4
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4;
    floor.receiveShadow = true;
    scene.add(floor);

    // === MOUSE / SCROLL INTERACTION ===
    let mouseX = 0, mouseY = 0;
    let scrollY = 0;
    const targetCamX = { value: 0 }, targetCamY = { value: 0 };

    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    window.addEventListener('scroll', () => {
      scrollY = window.pageYOffset;
    }, { passive: true });

    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = clock.getDelta();

      // Camera parallax
      targetCamX.value = mouseX * 1.5;
      targetCamY.value = -mouseY * 0.8;
      camera.position.x += (targetCamX.value - camera.position.x) * 0.05;
      camera.position.y += (0.5 + targetCamY.value - camera.position.y) * 0.05;
      const scrollOffset = Math.min(scrollY * 0.002, 3);
      camera.position.z = 12 + scrollOffset;
      camera.lookAt(0, 0, 0);

      // Equipment float & rotate
      equipment.forEach((eq) => {
        const ud = eq.userData;
        eq.position.y = ud.baseY + Math.sin(t * 0.6 + ud.baseRot[0]) * ud.floatAmp;
        eq.rotation.x = ud.baseRot[0] + Math.sin(t * 0.3) * 0.1;
        eq.rotation.y += ud.rotSpeed * 0.01;
        eq.rotation.z = ud.baseRot[2] + Math.cos(t * 0.4) * 0.1;
      });

      // Floating metals orbit
      floatingMetals.forEach((s) => {
        const ud = s.userData;
        ud.angle += ud.speed;
        s.position.x = Math.cos(ud.angle) * ud.radius;
        s.position.z = Math.sin(ud.angle) * ud.radius - 2;
        s.position.y = ud.baseY + Math.sin(t * 0.5 + ud.angle) * 0.4;
        s.rotation.x += ud.rotSpeed.x;
        s.rotation.y += ud.rotSpeed.y;
        s.rotation.z += ud.rotSpeed.z;
      });

      // Particles drift
      const pPositions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3 + 1] += 0.005;
        if (pPositions[i * 3 + 1] > 10) pPositions[i * 3 + 1] = -10;
        pPositions[i * 3] += Math.sin(t + i) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.02;

      renderer.render(scene, camera);
    }
    animate();

    // === RESIZE ===
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  };

  // === CURSOR ===
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');
  let cursorX = 0, cursorY = 0, followerX = 0, followerY = 0;

  if (window.matchMedia('(min-width: 901px)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    });
    function animateCursor() {
      followerX += (cursorX - followerX) * 0.15;
      followerY += (cursorY - followerY) * 0.15;
      cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    document.querySelectorAll('a, button, [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); cursorFollower.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); cursorFollower.classList.remove('hover'); });
    });
  }

  // === NAV SCROLL ===
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  // === MOBILE MENU ===
  const navBurger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  navBurger?.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

  // === 3D TILT EFFECT ===
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width) * 100;
      const yPct = (y / rect.height) * 100;
      const rotateX = ((yPct - 50) / 50) * -6;
      const rotateY = ((xPct - 50) / 50) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      card.style.setProperty('--mx', `${xPct}%`);
      card.style.setProperty('--my', `${yPct}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // === COUNTER ANIMATION ===
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(target * eased);
          if (progress < 1) requestAnimationFrame(animate);
          else el.textContent = target;
        };
        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // === REVEAL ON SCROLL ===
  const reveals = document.querySelectorAll('.section-head, .program-card, .plan-card, .trainer-card, .facility, .testimonial, .location-wrap, .contact-form, .stats-strip');
  reveals.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), 50);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  // === INIT 3D ===
  if (typeof THREE !== 'undefined') {
    initHero3D();
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    script.onload = initHero3D;
    document.head.appendChild(script);
  }
})();
