/* ======================================================================
   APP.JS — المحرك الرئيسي للمنيو التفاعلي ثلاثي الأبعاد
   ======================================================================
   يستخدم Three.js للمشهد ثلاثي الأبعاد و GSAP للحركات السلسة
   ====================================================================== */

import { supabase } from './src/supabaseClient.js';

(function () {
  "use strict";

  let MENU_DATA = { restaurant: {}, categories: [] };

  window.onerror = function (msg, url, lineNo, columnNo, error) {
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:10%;left:10%;width:80%;background:red;color:white;z-index:999999;padding:20px;font-size:16px;direction:ltr;';
    errDiv.innerHTML = `Error: ${msg}<br>Line: ${lineNo}<br>Col: ${columnNo}<br>URL: ${url}`;
    document.body.appendChild(errDiv);
    return false;
  };

  // =================================================================
  //  CONSTANTS
  // =================================================================
  const CAROUSEL_RADIUS = 4.5;
  const CARD_SPREAD_FACTOR = 0.45; // radians between cards
  const SNAP_EASE = "power3.out";
  const SNAP_DURATION = 0.65;
  const AUTO_ROTATE_DELAY = 4500;
  const AUTO_ROTATE_SPEED = 0.0003;
  const DRAG_SENSITIVITY = 0.005;
  const MOBILE_DRAG_SENSITIVITY = 0.007;
  const PARTICLE_COUNT = 35;

  // =================================================================
  //  STATE
  // =================================================================
  let currentView = "categories";
  let selectedCategoryIndex = 0;
  let activeIndex = 0;
  let carouselAngle = 0;
  let targetAngle = 0;
  let isDragging = false;
  let dragStartY = 0;
  let dragStartAngle = 0;
  let lastDragY = 0;
  let dragVelocity = 0;
  let autoRotateTimer = null;
  let autoRotating = false;
  let autoRotateDir = 1;
  let cardMeshes = [];
  let scene, camera, renderer, ambientLight, dirLight, pointLight1, pointLight2;
  let animationId;
  let currentItems = [];
  let isMobile = window.innerWidth < 768;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin('anonymous');

  // =================================================================
  //  DOM REFS
  // =================================================================
  const $ = (sel) => document.querySelector(sel);
  const canvas = $("#carouselCanvas");
  const backBtn = $("#backBtn");
  const categoryInfoCard = $("#categoryInfoCard");
  const categoryIcon = $("#categoryIcon");
  const categoryTitle = $("#categoryTitle");
  const categorySubtitle = $("#categorySubtitle");
  const categoryCount = $("#categoryCount");
  const categorySelectBtn = $("#categorySelectBtn");
  const productInfoCard = $("#productInfoCard");
  const productTag = $("#productTag");
  const productTitle = $("#productTitle");
  const productDesc = $("#productDesc");
  const productPrice = $("#productPrice");
  // =================================================================
  //  THREE.JS SETUP
  // =================================================================
  function initThree() {
    scene = new THREE.Scene();
    // Removed fog to keep the background clear

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.8, 8.5);
    camera.lookAt(0, -0.2, 0);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lights
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    dirLight.position.set(3, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.radius = 4;
    scene.add(dirLight);

    pointLight1 = new THREE.PointLight(0xd4a843, 0.8, 18);
    pointLight1.position.set(-4, 3, 4);
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(0xb91c1c, 0.4, 14);
    pointLight2.position.set(4, 2, -2);
    scene.add(pointLight2);

    // Ground reflection plane
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      metalness: 0.9,
      roughness: 0.3,
      transparent: true,
      opacity: 0.6,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // =================================================================
  //  CARD CREATION — 3D CIRCULAR CARDS
  // =================================================================
  let htmlLabels = [];

  function getItemFoodImage(item) {
    const id = (item.id || '').toLowerCase();

    // Shawarma mapping
    if (id.includes('shawarma-chicken')) return 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('shawarma-meat')) return 'https://images.unsplash.com/photo-1601894128024-4f5c53140f36?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('shawarma-mix')) return 'https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('shawarma-plate')) return 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=400&h=400&q=80';
    if (id === 'shawarma') return 'https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?auto=format&fit=crop&w=400&h=400&q=80';

    // Zinger mapping
    if (id.includes('zinger-classic')) return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('zinger-spicy')) return 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('zinger-supreme')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('zinger-wrap')) return 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=400&h=400&q=80';
    if (id === 'zinger') return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&h=400&q=80';

    // Burger mapping
    if (id.includes('burger-classic')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('burger-mushroom')) return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('burger-double')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('burger-chicken')) return 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=400&h=400&q=80';
    if (id === 'burger') return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=400&q=80';

    // Grills mapping
    if (id.includes('grills-kebab') || id.includes('kebab')) return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('grills-tikka') || id.includes('tikka')) return 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('grills-mixed') || id.includes('mix')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('grills-ribs') || id.includes('ribs')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&h=400&q=80';
    if (id === 'grills' || id === 'grill') return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&h=400&q=80';

    // Pizza mapping
    if (id.includes('pizza-margherita')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('pizza-pepperoni')) return 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('pizza-vegetable')) return 'https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('pizza-bbq-chicken')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&h=400&q=80';
    if (id === 'pizza') return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&h=400&q=80';

    // Drinks mapping
    if (id.includes('drink-cola')) return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('drink-orange')) return 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('drink-lemon-mint')) return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&h=400&q=80';
    if (id.includes('drink-water')) return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=400&h=400&q=80';
    if (id === 'drinks' || id === 'drink') return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&h=400&q=80';

    // Default fallback
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&h=400&q=80&fm=webp';
  }

  function preloadAdjacentImages(currentIndex) {
    if (!currentItems || currentItems.length === 0) return;
    
    const preload = (index) => {
      if (index >= 0 && index < currentItems.length) {
        const item = currentItems[index];
        let imgUrl = item.image;
        if (imgUrl && imgUrl.includes('picsum.photos')) {
          imgUrl = getItemFoodImage(item);
        }
        if (imgUrl) {
          const img = new Image();
          img.src = imgUrl;
        }
      }
    };

    preload(currentIndex + 1);
    preload(currentIndex - 1);
  }

  function createCardMesh(item, index) {
    const group = new THREE.Group();

    const radius = isMobile ? 0.7 : 0.95;
    const thickness = 0.06;

    // Create cylinder (circle with thickness)
    // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
    const cardGeo = new THREE.CylinderGeometry(radius, radius, thickness, 48);

    // Rotate cylinder so the top flat circular face faces forward (towards +Z)
    cardGeo.rotateX(Math.PI / 2);

    const color = new THREE.Color(item.color || "#D4A843");

    // Default material for sides and back
    const sideMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.4,
      roughness: 0.5,
    });

    // Front material with texture (Basic material to show original colors)
    const frontMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, // White to show original image colors
    });

    // Load texture
    if (item.image) {
      let imgUrl = item.image;
      if (imgUrl.includes('picsum.photos')) {
        imgUrl = getItemFoodImage(item);
      }

      textureLoader.load(imgUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;

        // Preserve aspect ratio like CSS object-fit: cover
        const image = texture.image;
        if (image) {
          const aspect = image.height / image.width;
          texture.center.set(0.5, 0.5);
          texture.rotation = Math.PI / 2; // Required due to Cylinder UV rotation

          if (aspect > 1) {
            texture.repeat.set(1, 1 / aspect);
            texture.offset.set(0, (1 - 1 / aspect) / 2);
          } else {
            texture.repeat.set(aspect, 1);
            texture.offset.set((1 - aspect) / 2, 0);
          }
        }

        frontMat.map = texture;
        frontMat.needsUpdate = true;
      });
    }

    // Material array for cylinder: [side, top(front after rotation), bottom(back after rotation)]
    // In three.js Cylinder geometry materials are: 0=side, 1=top, 2=bottom
    const materials = [sideMat, frontMat, sideMat];

    const cardMesh = new THREE.Mesh(cardGeo, materials);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    group.add(cardMesh);

    // Glowing rim
    const rimGeo = new THREE.TorusGeometry(radius + 0.02, 0.03, 16, 48);
    const rimMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    group.add(rim);

    // Glow removed for cleaner background

    group.userData = {
      index,
      item,
      cardMat: sideMat,
      rimMat,
    };

    return group;
  }

  function createHTMLLabel(item, index) {
    const el = document.createElement("div");
    el.className = "carousel-label";
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "عرض تفاصيل " + item.name);
    el.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      text-align: center;
      font-family: 'Cairo', sans-serif;
      direction: rtl;
      white-space: nowrap;
      transition: opacity 0.3s ease;
      z-index: 2;
      background: transparent;
      padding: 0;
      border: none;
      box-shadow: none;
      transform: translateZ(0);
    `;

    const name = document.createElement("div");
    name.style.cssText = `
      font-size: ${isMobile ? "12px" : "14px"};
      font-weight: 800;
      color: #F0D078;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8);
      transition: transform 0.3s ease;
    `;
    name.textContent = item.name;

    el.appendChild(name);
    el.dataset.index = index;
    document.body.appendChild(el);

    return el;
  }



  // =================================================================
  //  CAROUSEL LAYOUT
  // =================================================================
  function buildCarousel(items, isCategory) {
    clearCarousel();
    currentItems = items;
    activeIndex = 0;
    carouselAngle = 0;

    items.forEach((item, i) => {
      const mesh = createCardMesh(item, i);
      scene.add(mesh);
      cardMeshes.push(mesh);

      const label = createHTMLLabel(item, i);
      htmlLabels.push(label);
    });

    updateCarouselPositions(true);
    updateInfoCard();
  }

  function clearCarousel() {
    cardMeshes.forEach((m) => {
      scene.remove(m);
      // Dispose geometries and materials
      m.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    cardMeshes = [];
    htmlLabels.forEach((el) => el.remove());
    htmlLabels = [];
  }

  function getAngleForIndex(index) {
    const count = currentItems.length;
    if (count <= 1) return 0;
    const center = (count - 1) / 2;
    return (index - center) * CARD_SPREAD_FACTOR;
  }

  function updateCarouselPositions(immediate) {
    const count = currentItems.length;
    if (count === 0) return;

    const depthMap = [];

    cardMeshes.forEach((group, i) => {
      // Virtualization: only render active item and 3 items on each side
      const distance = Math.abs(i - activeIndex);
      if (distance > 3) {
        group.visible = false;
        return;
      }
      group.visible = true;

      const baseAngle = getAngleForIndex(i);
      const angle = baseAngle + carouselAngle;

      // Vertical semi-circle on the right side
      // Center of arc is at x = 4.5
      // angle = 0 is the center-leftmost item (the active one)
      // Move the arc further to the right edge
      const arcCenterX = isMobile ? 4.8 : 6.5;
      const x = arcCenterX - Math.cos(angle) * CAROUSEL_RADIUS;
      const y = Math.sin(angle) * CAROUSEL_RADIUS;
      const z = -Math.abs(angle) * 1.5; // push backward as they go up/down

      const dist = Math.abs(angle);
      const maxDist = CARD_SPREAD_FACTOR * ((count - 1) / 2 + 1);
      const t = Math.min(dist / (maxDist * 0.65), 1);

      // Make inactive items shrink to 0.75 and active to 1.2
      const scaleEase = Math.pow(t, 0.6); // Shrinks quickly as it moves away from 0
      const scale = THREE.MathUtils.lerp(1.2, 0.75, scaleEase);
      const opacity = THREE.MathUtils.lerp(1, 0.5, t);

      const rotY = Math.sin(angle) * -0.2; // slight turn towards camera
      const rotZ = angle * 0.15; // slight tilt along the arc
      const rotX = 0;

      if (immediate) {
        group.position.set(x, y, z);
        group.rotation.set(rotX, rotY, rotZ);
        group.scale.setScalar(scale);
      } else {
        group.position.x += (x - group.position.x) * 0.2;
        group.position.y += (y - group.position.y) * 0.2;
        group.position.z += (z - group.position.z) * 0.2;
        group.rotation.x += (rotX - group.rotation.x) * 0.2;
        group.rotation.y += (rotY - group.rotation.y) * 0.2;
        group.rotation.z += (rotZ - group.rotation.z) * 0.2;
        const cs = group.scale.x;
        const ns = cs + (scale - cs) * 0.2;
        group.scale.setScalar(ns);
      }

      if (t < 0.1) {
        group.userData.rimMat.color.setHex(0xffffff);
        group.userData.rimMat.opacity = 0.3;
        group.userData.glowMat.opacity = 0.5; // Strong drop shadow for active
      } else {
        group.userData.rimMat.color.set(group.userData.item.color || 0xD4A843);
        group.userData.rimMat.opacity = (1 - t) * 0.4;
        group.userData.glowMat.opacity = (1 - t) * 0.15;
      }

      // Update overall opacity
      if (group.children) {
        group.children.forEach(c => {
          if (c.material && c.material.opacity !== undefined && c.material !== group.userData.glowMat && c.material !== group.userData.rimMat) {
            c.material.opacity = opacity;
          }
        });
      }

      depthMap.push({ index: i, z: z, angle: angle, dist: dist });
    });

    depthMap.sort((a, b) => a.z - b.z);

    htmlLabels.forEach((el, i) => {
      const distance = Math.abs(i - activeIndex);
      if (distance > 3) {
        el.style.display = "none";
        return;
      }
      el.style.display = "block";

      const group = cardMeshes[i];
      if (!group) return;

      const pos = new THREE.Vector3();
      group.getWorldPosition(pos);

      // Position label directly below the card (closer to the perimeter)
      const labelMargin = isMobile ? 0.75 : 1.0;
      pos.y -= labelMargin * group.scale.x;

      const projected = pos.clone().project(camera);
      const hw = window.innerWidth / 2;
      const hh = window.innerHeight / 2;
      const sx = projected.x * hw + hw;
      const sy = -projected.y * hh + hh;

      const baseAngle = getAngleForIndex(i);
      const angle = baseAngle + carouselAngle;
      const dist = Math.abs(angle);

      // Hide label if it goes below the center (behind the info card)
      const isUnderCard = sy > (window.innerHeight / 2) + (isMobile ? 120 : 160);

      const maxVis = CARD_SPREAD_FACTOR * 1.5;
      let opacityVal = "0";
      let scaleVal = group.scale.x;

      if (isUnderCard) {
        scaleVal = 0.5;
      } else if (i === activeIndex) {
        opacityVal = "1";
        scaleVal = group.scale.x * 1.5;
      } else if (dist < maxVis) {
        opacityVal = String(THREE.MathUtils.lerp(1, 0, Math.pow(dist / maxVis, 2)));
      }

      el.style.opacity = opacityVal;
      // Use translate3d for GPU acceleration and avoid left/top thrashing
      el.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%) scale(${scaleVal})`;

      const depthEntry = depthMap.find((d) => d.index === i);
      el.style.zIndex = depthEntry ? String(Math.round(depthEntry.z * 10) + 50) : "1";
    });



    let minDist = Infinity;
    let newActive = 0;
    for (let i = 0; i < count; i++) {
      const a = Math.abs(getAngleForIndex(i) + carouselAngle);
      if (a < minDist) {
        minDist = a;
        newActive = i;
      }
    }

    if (newActive !== activeIndex) {
      activeIndex = newActive;
      updateInfoCard();
      preloadAdjacentImages(activeIndex);
    }
  }

  // =================================================================
  //  INFO CARD & BACKGROUND UPDATES
  // =================================================================
  function updateInfoCard() {
    if (currentView === "categories") {
      gsap.to(categoryInfoCard, {
        opacity: 0,
        duration: 0.1,
        onComplete: () => {
          const currentCat = MENU_DATA.categories[activeIndex];
          if (!currentCat) return;
          
          updateDynamicBackground(currentCat.image);

          if (categoryIcon) categoryIcon.style.display = "none";
          categoryTitle.textContent = currentCat.name;
          categorySubtitle.textContent = `تشكيلة مميزة من ألذ أطباق ${currentCat.name}`;

          const badge = document.getElementById("categoryBadge");
          if (badge) badge.textContent = `متوفر ${currentCat.items.length} أطباق مميزة`;

          categoryInfoCard.style.display = "block";
          productInfoCard.style.display = "none";

          gsap.fromTo(categoryInfoCard, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.inOut" });
        },
      });

    } else {
      gsap.to(productInfoCard, {
        opacity: 0,
        duration: 0.1,
        onComplete: () => {
          const currentCat = MENU_DATA.categories[selectedCategoryIndex];
          const currentItem = currentCat.items[activeIndex];
          if (!currentItem) return;
          
          updateDynamicBackground(currentItem.image);

          productTag.textContent = currentCat.name;
          productTitle.textContent = currentItem.name;
          productDesc.textContent = currentItem.description;
          productPrice.textContent = currentItem.price;

          productInfoCard.style.display = "block";
          categoryInfoCard.style.display = "none";

          gsap.fromTo(productInfoCard, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.inOut" });
        },
      });
    }
  }

  function updateDynamicBackground(imageUrl) {
    const container = document.getElementById("dynamicBgContainer");
    if (!container || !imageUrl) return;

    const newBg = document.createElement("div");
    newBg.className = "dynamic-bg-layer";
    newBg.style.backgroundImage = `url(${imageUrl})`;
    
    container.appendChild(newBg);
    
    // Force reflow to ensure the transition applies
    void newBg.offsetWidth;
    newBg.style.opacity = "1";
    
    // Fade out and remove old layers
    const oldBgs = container.querySelectorAll(".dynamic-bg-layer:not(:last-child)");
    oldBgs.forEach(bg => {
        if (bg && bg.style) {
            bg.style.opacity = "0";
        }
        setTimeout(() => {
            if (bg && bg.parentNode) bg.parentNode.removeChild(bg);
        }, 850);
    });
  }

  // =================================================================
  //  DRAG / TOUCH INTERACTION
  // =================================================================
  function onPointerDown(e) {
    if (e.target && e.target.closest && e.target.closest(".info-card, .header, .back-btn")) return;

    isDragging = true;
    const clientY = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    dragStartY = clientY;
    dragStartAngle = carouselAngle;
    targetAngle = carouselAngle;
    lastDragY = clientY;
    dragVelocity = 0;

    stopAutoRotate();
    gsap.killTweensOf("carouselSnap");

    canvas.style.cursor = "grabbing";
    categoryInfoCard.classList.add("will-change-transform");
    productInfoCard.classList.add("will-change-transform");
    htmlLabels.forEach(el => el.classList.add("will-change-transform"));
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    const clientY = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    // Invert delta so swiping UP brings bottom items UP into view
    const delta = dragStartY - clientY;
    const sensitivity = isMobile ? MOBILE_DRAG_SENSITIVITY : DRAG_SENSITIVITY;

    targetAngle = dragStartAngle + delta * sensitivity;
    dragVelocity = (lastDragY - clientY) * sensitivity;
    lastDragY = clientY;

    const maxAngle = getMaxAngle();
    if (targetAngle > maxAngle + 0.3) targetAngle = maxAngle + 0.3;
    if (targetAngle < -maxAngle - 0.3) targetAngle = -maxAngle - 0.3;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    canvas.style.cursor = "grab";

    categoryInfoCard.classList.remove("will-change-transform");
    productInfoCard.classList.remove("will-change-transform");
    htmlLabels.forEach(el => el.classList.remove("will-change-transform"));

    const inertia = dragVelocity * 10;
    let finalAngle = carouselAngle + inertia;

    const maxAngle = getMaxAngle();
    finalAngle = Math.max(-maxAngle, Math.min(maxAngle, finalAngle));

    let nearestDist = Infinity;
    let snapAngle = 0;
    for (let i = 0; i < currentItems.length; i++) {
      const target = -getAngleForIndex(i);
      const d = Math.abs(finalAngle - target);
      if (d < nearestDist) {
        nearestDist = d;
        snapAngle = target;
      }
    }

    const snapObj = { val: carouselAngle };
    gsap.to(snapObj, {
      val: snapAngle,
      duration: SNAP_DURATION,
      ease: SNAP_EASE,
      id: "carouselSnap",
      onUpdate: () => {
        carouselAngle = snapObj.val;
        updateCarouselPositions(false);
      },
      onComplete: () => {
        startAutoRotateTimer();
      },
    });
  }

  function getMaxAngle() {
    if (currentItems.length <= 1) return 0;
    return Math.abs(getAngleForIndex(currentItems.length - 1));
  }

  let pointerDownTime = 0;
  function handleTapStart() {
    pointerDownTime = Date.now();
  }

  function handleTapEnd(e) {
    const dt = Date.now() - pointerDownTime;
    const clientX = e.clientX != null ? e.clientX : 0;
    const clientY = e.clientY != null ? e.clientY : 0;
    const dist = Math.abs(clientY - dragStartY);

    if (dt < 300 && dist < 12) {
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(cardMeshes, true);

      if (intersects.length > 0) {
        let object = intersects[0].object;
        while (object.parent && object.parent !== scene) {
          if (cardMeshes.includes(object)) break;
          object = object.parent;
        }

        const clickedIndex = cardMeshes.indexOf(object);

        if (clickedIndex !== -1) {
          if (clickedIndex === activeIndex) {
            if (currentView === "categories") enterProductsView(activeIndex);
          } else {
            stopAutoRotate();
            const targetAngleVal = -getAngleForIndex(clickedIndex);

            const snapObj = { val: carouselAngle };
            gsap.to(snapObj, {
              val: targetAngleVal,
              duration: SNAP_DURATION,
              ease: SNAP_EASE,
              id: "carouselSnap",
              onUpdate: () => {
                carouselAngle = snapObj.val;
                updateCarouselPositions(false);
              },
              onComplete: () => {
                startAutoRotateTimer();
              },
            });
          }
        }
      }
    }
  }

  // =================================================================
  //  AUTO-ROTATE
  // =================================================================
  function startAutoRotateTimer() {
    // Disabled per user request
  }

  function stopAutoRotate() {
    autoRotating = false;
    if (autoRotateTimer) {
      clearTimeout(autoRotateTimer);
      autoRotateTimer = null;
    }
  }

  function processAutoRotate() {
    if (!autoRotating || isDragging) return;

    carouselAngle += AUTO_ROTATE_SPEED * autoRotateDir;

    const maxAngle = getMaxAngle();
    if (carouselAngle > maxAngle) {
      carouselAngle = maxAngle;
      autoRotateDir = -1;
    } else if (carouselAngle < -maxAngle) {
      carouselAngle = -maxAngle;
      autoRotateDir = 1;
    }

    updateCarouselPositions(false);
  }

  // =================================================================
  //  VIEW TRANSITIONS
  // =================================================================
  function enterProductsView(catIndex) {
    selectedCategoryIndex = catIndex;
    const cat = MENU_DATA.categories[catIndex];
    currentView = "products";

    const tl = gsap.timeline();

    // Fast Crossfade
    tl.to(categoryInfoCard, { opacity: 0, duration: 0.2, ease: "power1.inOut" }, 0);

    cardMeshes.forEach((m) => {
      m.children.forEach(c => {
        if (c.material && c.material.opacity !== undefined) {
           gsap.to(c.material, { opacity: 0, duration: 0.2, ease: "power1.inOut" });
        }
        if (c.material && Array.isArray(c.material)) {
           c.material.forEach(mat => gsap.to(mat, { opacity: 0, duration: 0.2, ease: "power1.inOut" }));
        }
      });
    });

    htmlLabels.forEach((el) => {
       gsap.to(el, { opacity: 0, duration: 0.2, ease: "power1.inOut" });
    });

    tl.to({}, {
      duration: 0.2,
      onComplete: () => {
        const updateDOM = () => {
          buildCarousel(cat.items, false);
          
          const headerLogoText = document.getElementById("headerLogoText");
          if (headerLogoText) headerLogoText.textContent = cat.name;

          backBtn.style.display = "flex";
          gsap.fromTo(backBtn, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.inOut" });
          backBtn.classList.add("visible");
          autoRotateDir = 1;
          startAutoRotateTimer();
        };

        if (document.startViewTransition) {
          document.startViewTransition(updateDOM);
        } else {
          updateDOM();
        }
      },
    }, 0);
  }

  function exitToCategories() {
    currentView = "categories";

    const tl = gsap.timeline();
    tl.to(productInfoCard, { opacity: 0, duration: 0.2, ease: "power1.inOut" }, 0);
    tl.to(backBtn, { opacity: 0, duration: 0.2, ease: "power1.inOut" }, 0);

    cardMeshes.forEach((m) => {
      m.children.forEach(c => {
        if (c.material && c.material.opacity !== undefined) {
           gsap.to(c.material, { opacity: 0, duration: 0.2, ease: "power1.inOut" });
        }
        if (c.material && Array.isArray(c.material)) {
           c.material.forEach(mat => gsap.to(mat, { opacity: 0, duration: 0.2, ease: "power1.inOut" }));
        }
      });
    });

    htmlLabels.forEach((el) => {
       gsap.to(el, { opacity: 0, duration: 0.2, ease: "power1.inOut" });
    });

    tl.to({}, {
      duration: 0.2,
      onComplete: () => {
        const updateDOM = () => {
          backBtn.style.display = "none";
          backBtn.classList.remove("visible");
          
          const headerLogoText = document.getElementById("headerLogoText");
          if (headerLogoText) {
              headerLogoText.textContent = MENU_DATA.restaurant?.name || "المطعم";
          }

          buildCarousel(MENU_DATA.categories, true);
          autoRotateDir = 1;
          startAutoRotateTimer();
        };

        if (document.startViewTransition) {
          document.startViewTransition(updateDOM);
        } else {
          updateDOM();
        }
      },
    });
  }


  // =================================================================
  //  KEYBOARD NAV
  // =================================================================
  function navigateByStep(dir) {
    stopAutoRotate();
    const newIndex = Math.max(0, Math.min(currentItems.length - 1, activeIndex + dir));
    if (newIndex === activeIndex) return;

    const targetAngleVal = -getAngleForIndex(newIndex);

    const snapObj = { val: carouselAngle };
    gsap.to(snapObj, {
      val: targetAngleVal,
      duration: SNAP_DURATION,
      ease: SNAP_EASE,
      id: "carouselSnap",
      onUpdate: () => {
        carouselAngle = snapObj.val;
        updateCarouselPositions(false);
      },
      onComplete: () => {
        startAutoRotateTimer();
      },
    });
  }

  // =================================================================
  //  RENDER LOOP
  // =================================================================
  function animate() {
    animationId = requestAnimationFrame(animate);

    processAutoRotate();

    if (isDragging) {
      carouselAngle += (targetAngle - carouselAngle) * 0.3;
      updateCarouselPositions(false);
    } else if (currentItems.length > 0) {
      updateCarouselPositions(false);
    }

    const t = Date.now() * 0.001;
    pointLight1.intensity = 0.9 + Math.sin(t * 0.7) * 0.15;
    pointLight2.intensity = 0.4 + Math.sin(t * 0.5 + 1) * 0.1;
    pointLight1.position.x = -4 + Math.sin(t * 0.3) * 0.5;

    camera.position.y = 0.8 + Math.sin(t * 0.25) * 0.04;

    renderer.render(scene, camera);
  }

  // =================================================================
  //  RESIZE
  // =================================================================
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    isMobile = w < 768;

    camera.aspect = w / h;

    if (isMobile) {
      camera.position.set(0, 0.6, 10);
      camera.fov = 58;
    } else {
      camera.position.set(0, 0.8, 8.5);
      camera.fov = 50;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // =================================================================
  //  EVENTS
  // =================================================================
  function bindEvents() {
    canvas.addEventListener("pointerdown", (e) => {
      handleTapStart();
      onPointerDown(e);
    }, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", (e) => {
      handleTapEnd(e);
      onPointerUp(e);
    });

    canvas.addEventListener("touchstart", (e) => {
      handleTapStart();
      onPointerDown(e);
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      onPointerMove(e);
    }, { passive: true });
    window.addEventListener("touchend", (e) => {
      const t = e.changedTouches ? e.changedTouches[0] : { clientX: window.innerWidth / 2, clientY: lastDragY };
      handleTapEnd(t);
      onPointerUp(t);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") navigateByStep(1);
      if (e.key === "ArrowRight") navigateByStep(-1);
      if (e.key === "Enter" && currentView === "categories") enterProductsView(activeIndex);
      if ((e.key === "Escape" || e.key === "Backspace") && currentView === "products") exitToCategories();
    });

    categorySelectBtn.addEventListener("click", () => enterProductsView(activeIndex));
    backBtn.addEventListener("click", exitToCategories);

    window.addEventListener("resize", onResize);
    canvas.addEventListener("wheel", (e) => {
      const dir = e.deltaY > 0 ? 1 : -1;
      navigateByStep(dir);
    }, { passive: true });
  }

  // =================================================================
  //  DATA FETCH
  // =================================================================
  async function loadMenuData() {
    try {
      const { data: rest } = await supabase.from('restaurant_info').select('*').single();
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      const { data: prods } = await supabase.from('products').select('*').order('sort_order', { ascending: true });

      if (rest) MENU_DATA.restaurant = rest;
      if (cats) {
        MENU_DATA.categories = cats.map(c => ({
          ...c,
          items: prods ? prods.filter(p => p.category_id === c.id) : []
        }));
      }
      
      // Update Header Logo Text & Favicon
      const headerLogoText = document.getElementById("headerLogoText");
      if (MENU_DATA.restaurant) {
          const isUrl = MENU_DATA.restaurant.logo && MENU_DATA.restaurant.logo.startsWith('http');
          
          if (headerLogoText && MENU_DATA.restaurant.name) {
              headerLogoText.textContent = MENU_DATA.restaurant.name;
          }
          
          if (isUrl) {
              let link = document.querySelector("link[rel~='icon']");
              if (!link) {
                  link = document.createElement('link');
                  link.rel = 'icon';
                  document.head.appendChild(link);
              }
              link.href = MENU_DATA.restaurant.logo;
          }
      }
    } catch (e) {
      console.error("Error loading menu data:", e);
    }
  }

  // =================================================================
  //  INIT
  // =================================================================
  async function init() {
    await loadMenuData();
    initThree();
    bindEvents();

    buildCarousel(MENU_DATA.categories, true);
    animate();
    onResize();
    startAutoRotateTimer();

    canvas.style.cursor = "grab";
    canvas.style.touchAction = "pan-y";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
