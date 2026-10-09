'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type AssistantVisualState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface HologramCanvasProps {
  visualState: AssistantVisualState;
  audioLevel?: number; // 0.0 to 1.0 real-time audio amplitude
  analyserNode?: AnalyserNode | null;
  /** Live loudness written by the voice hook every frame (no React re-render needed). */
  levelRef?: React.MutableRefObject<number>;
}

export const HologramCanvas: React.FC<HologramCanvasProps> = ({
  visualState,
  audioLevel = 0,
  analyserNode,
  levelRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualStateRef = useRef<AssistantVisualState>(visualState);
  const audioLevelRef = useRef<number>(audioLevel);
  const analyserRef = useRef<AnalyserNode | null>(analyserNode || null);
  const externalLevelRef = useRef<React.MutableRefObject<number> | undefined>(levelRef);
  externalLevelRef.current = levelRef;

  useEffect(() => {
    visualStateRef.current = visualState;
  }, [visualState]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    analyserRef.current = analyserNode || null;
  }, [analyserNode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Build the 3D orb a moment after the page has painted (browser idle time), so opening the website
    // stays smooth instead of freezing while thousands of particles and shaders are prepared.
    let cleanup: (() => void) | null = null;
    let cancelled = false;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const start = () => {
      if (cancelled) return;
      cleanup = initOrb(container);
    };
    const idleId = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 700 }) : window.setTimeout(start, 200);
    return () => {
      cancelled = true;
      if (w.cancelIdleCallback && w.requestIdleCallback) w.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      cleanup?.();
    };
  }, []);

  function initOrb(container: HTMLDivElement): () => void {

    // Detect mobile or low performance
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = isMobile ? 8000 : 22000;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.08);

    const cameraAspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(
      45,
      cameraAspect,
      0.1,
      100
    );
    // Keep the full outer ring inside the camera frustum on narrow mobile viewports.
    // This only changes camera distance; the orb geometry and animation remain untouched.
    const mobileFitZ = 2.15 / (Math.tan(THREE.MathUtils.degToRad(45 / 2)) * Math.max(cameraAspect, 0.01));
    camera.position.set(0, 0, isMobile ? Math.max(4.8, mobileFitZ) : 4.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    // The drawing surface is bigger than the container on every side so the rings are never cut off.
    // camera.setViewOffset keeps the orb at EXACTLY the same size and place on screen as before.
    const CANVAS_PAD = 0.18; // extra drawing area per side, as a share of the larger container side
    const applyFrame = (width: number, height: number) => {
      const pad = Math.round(Math.max(width, height) * CANVAS_PAD);
      camera.aspect = width / Math.max(height, 1);
      camera.setViewOffset(width, height, -pad, -pad, width + pad * 2, height + pad * 2);
      camera.updateProjectionMatrix();
      renderer.setSize(width + pad * 2, height + pad * 2);
      const el = renderer.domElement;
      el.style.position = 'absolute';
      el.style.left = `${-pad}px`;
      el.style.top = `${-pad}px`;
      el.style.maxWidth = 'none';
      el.style.pointerEvents = 'none';
      // Soft circular edge: anything drifting past the drawing area fades out as a circle (never a hard square).
      // The solid centre (84%) covers the whole orb and all three rings, so they are untouched.
      const mask = 'radial-gradient(circle closest-side at 50% 50%, #000 0%, #000 84%, rgba(0,0,0,0.55) 92%, transparent 100%)';
      el.style.webkitMaskImage = mask;
      el.style.maskImage = mask;
    };
    applyFrame(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Root Group for Arc Core
    const arcCoreGroup = new THREE.Group();
    scene.add(arcCoreGroup);

    // 2. Inner Wireframe Icosahedron & Nested Geometric Core
    const icosahedronGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const icosahedronMat = new THREE.MeshBasicMaterial({
      color: 0x6af0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const icosahedronMesh = new THREE.Mesh(icosahedronGeo, icosahedronMat);
    arcCoreGroup.add(icosahedronMesh);

    // Nested Inner Geometric Core (Octahedron for multi-layered arc reactor geometry)
    const innerOctaGeo = new THREE.OctahedronGeometry(0.58, 0);
    const innerOctaMat = new THREE.MeshBasicMaterial({
      color: 0x9ff8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const innerOctaMesh = new THREE.Mesh(innerOctaGeo, innerOctaMat);
    arcCoreGroup.add(innerOctaMesh);

    // Inner Solid Glow Core
    const innerCoreGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xb8fdff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    arcCoreGroup.add(innerCoreMesh);

    // 3. Particle Shell (20k+ GPU points)
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseRadius = 1.35;
    const cyanColor = new THREE.Color(0x38e8ff);
    const deepBlueColor = new THREE.Color(0x0066cc);
    const amberColor = new THREE.Color(0xffaa00);
    const whiteColor = new THREE.Color(0xdffcff);
    const violetColor = new THREE.Color(0x8b7bff);

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere surface + subtle depth jitter
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = baseRadius * (0.85 + Math.random() * 0.35);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;


      // Color mix: Mostly cyan/ice-blue with 4% amber warning accents
      const roll = Math.random();
      const col =
        roll < 0.03
          ? amberColor
          : roll < 0.1
          ? whiteColor
          : roll < 0.15
          ? violetColor
          : Math.random() > 0.4
          ? cyanColor
          : deepBlueColor;

      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Soft round particle texture so each GPU point renders as a circular glow instead of a square sprite.
    const particleTextureCanvas = document.createElement('canvas');
    particleTextureCanvas.width = 32;
    particleTextureCanvas.height = 32;
    const particleTextureContext = particleTextureCanvas.getContext('2d');
    if (!particleTextureContext) {
      throw new Error('Unable to create particle texture context');
    }
    const particleGradient = particleTextureContext.createRadialGradient(16, 16, 0, 16, 16, 16);
    particleGradient.addColorStop(0, 'rgba(255,255,255,1)');
    particleGradient.addColorStop(0.45, 'rgba(255,255,255,0.9)');
    particleGradient.addColorStop(0.75, 'rgba(255,255,255,0.35)');
    particleGradient.addColorStop(1, 'rgba(255,255,255,0)');
    particleTextureContext.fillStyle = particleGradient;
    particleTextureContext.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(particleTextureCanvas);
    particleTexture.needsUpdate = true;

    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.026 : 0.02,
      vertexColors: true,
      map: particleTexture,
      alphaMap: particleTexture,
      transparent: true,
      alphaTest: 0.01,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    // Ripple/pulse runs on the GPU (vertex shader) instead of a JS loop over thousands of points
    // every frame, which was the main reason the page stuttered while Jarvis was talking.
    const rippleUniforms = {
      uPulse: { value: 1.0 },
      uWave: { value: 0.0 },
      uRipple: { value: 0.0 },
      uAudio: { value: 0.0 },
    };
    particleMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, rippleUniforms);
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uPulse;\nuniform float uWave;\nuniform float uRipple;\nuniform float uAudio;'
        )
        .replace(
          '#include <begin_vertex>',
          'vec3 transformed = position * (uPulse + uRipple * sin(position.y * 5.0 + uWave) * (0.05 + uAudio * 0.18));'
        );
    };
    const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    arcCoreGroup.add(particlePoints);

    // 4. Three Counter-Rotating Torus Rings with Segmented Tick Marks
    const disposables: Array<{ dispose: () => void }> = [];
    function createSegmentedRing(radius: number, tube: number, segments: number, color: number) {
      const ringGroup = new THREE.Group();

      // Smooth base ring
      const torusGeo = new THREE.TorusGeometry(radius, tube, 8, 80);
      const torusMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.75,
        wireframe: true,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      ringGroup.add(torusMesh);

      // Segmented tick marks along perimeter: ONE instanced mesh per ring (was one mesh + material per tick,
      // ~150 separate draw calls every frame).
      const tickGeo = new THREE.BoxGeometry(0.015, 0.06, 0.02);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
      const ticks = new THREE.InstancedMesh(tickGeo, tickMat, segments);
      const dummy = new THREE.Object3D();
      const base = new THREE.Color(color);
      const amber = new THREE.Color(0xffaa00);
      for (let s = 0; s < segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        dummy.position.set(radius * Math.cos(angle), radius * Math.sin(angle), 0);
        dummy.rotation.set(0, 0, angle);
        dummy.updateMatrix();
        ticks.setMatrixAt(s, dummy.matrix);
        ticks.setColorAt(s, s % 4 === 0 ? amber : base);
      }
      ticks.instanceMatrix.needsUpdate = true;
      if (ticks.instanceColor) ticks.instanceColor.needsUpdate = true;
      ringGroup.add(ticks);
      disposables.push(torusGeo, torusMat, tickGeo, tickMat);

      return ringGroup;
    }

    // Inner Ring
    const ring1 = createSegmentedRing(1.5, 0.012, 32, 0x38e8ff);
    arcCoreGroup.add(ring1);

    // Middle Ring
    const ring2 = createSegmentedRing(1.75, 0.014, 48, 0x00f0ff);
    ring2.rotation.x = Math.PI / 4;
    arcCoreGroup.add(ring2);

    // Outer Ring
    const ring3 = createSegmentedRing(2.0, 0.012, 64, 0x0088ff);
    ring3.rotation.y = Math.PI / 3;
    arcCoreGroup.add(ring3);

    // 5. Fresnel Glow Shader Halo
    const fresnelVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fresnelFragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform vec3 glowColor;
      uniform float intensity;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        // abs() makes the halo a true rim glow (old max(0.0, ...) filled the whole disc flat)
        float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.6);
        gl_FragColor = vec4(glowColor, fresnel * intensity);
      }
    `;

    const fresnelMat = new THREE.ShaderMaterial({
      vertexShader: fresnelVertexShader,
      fragmentShader: fresnelFragmentShader,
      uniforms: {
        glowColor: { value: new THREE.Color(0x38e8ff) },
        intensity: { value: 0.75 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const fresnelSphere = new THREE.Mesh(new THREE.SphereGeometry(1.5, 48, 48), fresnelMat);
    arcCoreGroup.add(fresnelSphere);

    // 5b. Premium glass shell: rim light, iridescent cyan->violet shift, travelling specular shine and a scan sheen
    const glassMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vN;
        varying vec3 vV;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vN;
        varying vec3 vV;
        uniform float uTime;
        uniform float intensity;
        uniform float uAudio;
        void main() {
          vec3 n = normalize(vN);
          vec3 v = normalize(vV);
          float ndv = clamp(dot(n, v), 0.0, 1.0);
          float rim = pow(1.0 - ndv, 2.2);
          // travelling specular highlight
          vec3 L = normalize(vec3(cos(uTime * 0.55) * 0.9, 0.65, sin(uTime * 0.55) * 0.9 + 0.7));
          vec3 R = reflect(-L, n);
          float spec = pow(max(dot(R, v), 0.0), 48.0);
          float spec2 = pow(max(dot(reflect(-normalize(vec3(-L.x, -0.4, L.z + 0.4)), n), v), 0.0), 90.0);
          // diagonal sheen band sweeping across the glass
          float band = smoothstep(0.82, 1.0, sin((n.x * 0.9 + n.y * 0.7) * 5.0 - uTime * 1.5));
          vec3 cyan = vec3(0.22, 0.91, 1.0);
          vec3 violet = vec3(0.55, 0.48, 1.0);
          vec3 col = mix(cyan, violet, smoothstep(-0.6, 0.8, n.x * 0.7 + n.y * 0.5 + sin(uTime * 0.4) * 0.3));
          col = mix(col, vec3(1.0), clamp(spec * 0.9 + spec2 * 0.5 + band * 0.25, 0.0, 1.0));
          float a = 0.07 + rim * (0.7 + 0.5 * intensity + uAudio * 0.5) + spec * 0.85 + spec2 * 0.5 + band * (0.06 + rim * 0.5);
          gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        intensity: { value: 0.6 },
        uAudio: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glassSphere = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), glassMat);
    arcCoreGroup.add(glassSphere);

    // 5c. Soft bloom glow behind the orb + hot core glow (additive sprites, kept inside the camera frame)
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const glowCtx = glowCanvas.getContext('2d');
    if (glowCtx) {
      const gg = glowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gg.addColorStop(0, 'rgba(190,252,255,0.85)');
      gg.addColorStop(0.18, 'rgba(90,235,255,0.42)');
      gg.addColorStop(0.5, 'rgba(40,150,255,0.14)');
      gg.addColorStop(0.8, 'rgba(70,90,255,0.04)');
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      glowCtx.fillStyle = gg;
      glowCtx.fillRect(0, 0, 128, 128);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const bloomMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      fog: false,
    });
    const bloomSprite = new THREE.Sprite(bloomMat);
    bloomSprite.scale.set(3.9, 3.9, 1);
    bloomSprite.renderOrder = -2;
    scene.add(bloomSprite);

    const coreGlowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xd8feff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      fog: false,
    });
    const coreGlowSprite = new THREE.Sprite(coreGlowMat);
    coreGlowSprite.scale.set(1.25, 1.25, 1);
    coreGlowSprite.renderOrder = 5;
    scene.add(coreGlowSprite);

    // 5d. Energy comets running along the three rings (head + fading trail)
    const cometSprites: Array<{ sprite: THREE.Sprite; mat: THREE.SpriteMaterial; ring: number; lag: number; base: number; speed: number; r: number; head: number }> = [];
    const ringDefs: Array<[THREE.Group, number, number]> = [
      [ring1, 1.5, 0x9ffcff],
      [ring2, 1.75, 0x7fb8ff],
      [ring3, 2.0, 0xc4b5fd],
    ];
    ringDefs.forEach(([group, radius, colour], ri) => {
      for (let c = 0; c < 2; c++) {
        for (let k = 0; k < 6; k++) {
          const mat = new THREE.SpriteMaterial({
            map: particleTexture,
            color: k === 0 ? 0xffffff : colour,
            transparent: true,
            opacity: 1 - k / 6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
          });
          const sprite = new THREE.Sprite(mat);
          const sz = k === 0 ? 0.2 : 0.15 - k * 0.018;
          sprite.scale.set(sz, sz, 1);
          group.add(sprite);
          cometSprites.push({
            sprite,
            mat,
            ring: ri,
            lag: k * 0.07,
            base: c * Math.PI + ri * 1.3,
            speed: (ri % 2 === 0 ? 1 : -1) * (0.9 + ri * 0.25),
            r: radius,
            head: k === 0 ? 1 : 0,
          });
        }
      }
    });

    // 6. Audio Frequency Data Buffer
    const freqData = new Uint8Array(64);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Do not render the orb while it is scrolled out of view
    let onScreen = true;
    const screenObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            onScreen = entries[0].isIntersecting;
          })
        : null;
    screenObserver?.observe(container);

    // Adaptive sharpness: if the phone cannot keep up, render slightly fewer pixels (looks the same, runs smooth).
    let pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75);
    let perfFrames = 0;
    let perfAcc = 0;
    let lastFrameAt = 0;

    const animate = (now?: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isTabVisible || !onScreen) {
        lastFrameAt = 0;
        return;
      }
      if (document.documentElement.classList.contains('bg-paused')) {
        lastFrameAt = 0;
        return;
      }
      const t = typeof now === 'number' ? now : performance.now();
      if (lastFrameAt) {
        perfAcc += Math.min(t - lastFrameAt, 100);
        perfFrames++;
        if (perfFrames >= 90) {
          const avg = perfAcc / perfFrames;
          if (avg > 24 && pixelRatio > 1) {
            pixelRatio = Math.max(1, pixelRatio - 0.25);
            renderer.setPixelRatio(pixelRatio);
            applyFrame(container.clientWidth, container.clientHeight);
          }
          perfFrames = 0;
          perfAcc = 0;
        }
      }
      lastFrameAt = t;

      const elapsed = clock.getElapsedTime();
      const state = visualStateRef.current;

      // Extract real audio amplitude if analyser exists
      let computedAudio = Math.max(audioLevelRef.current, externalLevelRef.current?.current || 0);
      if (analyserRef.current) {
        try {
          analyserRef.current.getByteFrequencyData(freqData);
          let sum = 0;
          for (let k = 0; k < 32; k++) {
            sum += freqData[k];
          }
          const avg = sum / (32 * 255);
          computedAudio = Math.max(computedAudio, avg * 1.6);
        } catch {
          // Fall back to scalar level
        }
      }

      // States with distinct motion:
      // idle (slow breathing)
      // listening (rings tighten, particles pulled inward)
      // thinking (data streams, fast scan lines)
      // speaking (waveform ripples outward)

      let breath = Math.sin(elapsed * 1.5) * 0.04;
      let particlePulse = 1.0;
      let ringSpeedMultiplier = 1.0;
      let coreScale = 1.0;

      if (state === 'idle') {
        particlePulse = 1.0 + breath;
        ringSpeedMultiplier = 0.8;
        coreScale = 1.0 + breath * 0.5;
        fresnelMat.uniforms.intensity.value = 0.5 + breath * 2;
      } else if (state === 'listening') {
        // Rings tighten, particles pulled inward
        particlePulse = 0.82 + Math.sin(elapsed * 4.0) * 0.05 + computedAudio * 0.3;
        ringSpeedMultiplier = 2.2;
        coreScale = 0.88;
        fresnelMat.uniforms.intensity.value = 0.8 + computedAudio * 0.5;
      } else if (state === 'thinking') {
        // Fast rotation, energetic pulse
        particlePulse = 1.05 + Math.sin(elapsed * 10.0) * 0.12;
        ringSpeedMultiplier = 4.5;
        coreScale = 1.0 + Math.sin(elapsed * 8.0) * 0.08;
        fresnelMat.uniforms.intensity.value = 0.95;
      } else if (state === 'speaking') {
        // Waveform ripples outward driven by audio
        const audioBounce = computedAudio * 0.6;
        particlePulse = 1.15 + audioBounce + Math.sin(elapsed * 6.0) * 0.06;
        ringSpeedMultiplier = 2.5 + computedAudio * 4.0;
        coreScale = 1.08 + audioBounce * 0.5;
        fresnelMat.uniforms.intensity.value = 0.85 + audioBounce * 1.2;
      }

      if (prefersReducedMotion) {
        ringSpeedMultiplier = 0.2;
        particlePulse = 1.0;
      }

      // Premium shine: share the state-driven intensity with the glass shell, breathe the bloom
      glassMat.uniforms.uTime.value = elapsed;
      glassMat.uniforms.intensity.value = fresnelMat.uniforms.intensity.value;
      glassMat.uniforms.uAudio.value = Math.min(1, computedAudio);
      const bloomPulse = 0.78 + Math.sin(elapsed * 1.6) * 0.1 + Math.min(1, computedAudio) * 0.35;
      bloomMat.opacity = Math.min(1, bloomPulse * (state === 'idle' ? 0.9 : 1.1));
      coreGlowMat.opacity = Math.min(1, 0.75 + Math.sin(elapsed * 2.4) * 0.15 + Math.min(1, computedAudio) * 0.4);
      coreGlowSprite.scale.setScalar((1.15 + Math.sin(elapsed * 2.4) * 0.08) * coreScale + computedAudio * 0.5);
      const cometSpeed = ringSpeedMultiplier * (prefersReducedMotion ? 0.3 : 1);
      for (const cm of cometSprites) {
        const ang = cm.base + (elapsed * cm.speed * cometSpeed) * 0.8 - cm.lag * Math.sign(cm.speed) * 3.0;
        cm.sprite.position.set(Math.cos(ang) * cm.r, Math.sin(ang) * cm.r, 0);
      }

      // Counter-rotating rings
      const rotSpeed = 0.01 * ringSpeedMultiplier;
      ring1.rotation.z += rotSpeed;
      ring1.rotation.x += rotSpeed * 0.4;

      ring2.rotation.z -= rotSpeed * 1.25;
      ring2.rotation.y += rotSpeed * 0.6;

      ring3.rotation.y += rotSpeed * 1.4;
      ring3.rotation.x -= rotSpeed * 0.5;

      // Inner Core Mesh Rotation & Scaling
      icosahedronMesh.rotation.x += rotSpeed * 0.7;
      icosahedronMesh.rotation.y += rotSpeed * 0.9;
      icosahedronMesh.scale.setScalar(coreScale);

      innerOctaMesh.rotation.x -= rotSpeed * 1.1;
      innerOctaMesh.rotation.z += rotSpeed * 1.3;
      innerOctaMesh.scale.setScalar(coreScale * 0.85);

      innerCoreMesh.scale.setScalar(coreScale * 0.9);

      // Particle Displacement (GPU): ripple only while listening/speaking, otherwise a uniform breathing scale.
      const rippleOn = state === 'speaking' || state === 'listening';
      rippleUniforms.uPulse.value = particlePulse;
      rippleUniforms.uRipple.value = rippleOn ? 1 : 0;
      rippleUniforms.uWave.value = elapsed * 3.0;
      rippleUniforms.uAudio.value = computedAudio;

      // Global subtle tilt toward mouse/neutral
      arcCoreGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.15;
      arcCoreGroup.rotation.x = Math.cos(elapsed * 0.3) * 0.1;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 8. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      if (isMobile) {
        const fitZ = 2.15 / (Math.tan(THREE.MathUtils.degToRad(45 / 2)) * Math.max(camera.aspect, 0.01));
        camera.position.z = Math.max(4.8, fitZ);
      }
      applyFrame(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      screenObserver?.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      icosahedronGeo.dispose();
      icosahedronMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      fresnelMat.dispose();
      glassMat.dispose();
      glassSphere.geometry.dispose();
      fresnelSphere.geometry.dispose();
      bloomMat.dispose();
      coreGlowMat.dispose();
      glowTexture.dispose();
      cometSprites.forEach((cm) => cm.mat.dispose());
      disposables.forEach((d) => d.dispose());
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative pointer-events-none select-none overflow-visible"
    />
  );
};
