'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type AssistantVisualState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface HologramCanvasProps {
  visualState: AssistantVisualState;
  audioLevel?: number; // 0.0 to 1.0 real-time audio amplitude
  analyserNode?: AnalyserNode | null;
}

export const HologramCanvas: React.FC<HologramCanvasProps> = ({
  visualState,
  audioLevel = 0,
  analyserNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualStateRef = useRef<AssistantVisualState>(visualState);
  const audioLevelRef = useRef<number>(audioLevel);
  const analyserRef = useRef<AnalyserNode | null>(analyserNode || null);

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

    // Detect mobile or low performance
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = isMobile ? 8000 : 22000;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.08);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Root Group for Arc Core
    const arcCoreGroup = new THREE.Group();
    scene.add(arcCoreGroup);

    // 2. Inner Wireframe Icosahedron
    const icosahedronGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const icosahedronMat = new THREE.MeshBasicMaterial({
      color: 0x38e8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const icosahedronMesh = new THREE.Mesh(icosahedronGeo, icosahedronMat);
    arcCoreGroup.add(icosahedronMesh);

    // Inner Solid Glow Core
    const innerCoreGeo = new THREE.SphereGeometry(0.45, 24, 24);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.4,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    arcCoreGroup.add(innerCoreMesh);

    // 3. Particle Shell (20k+ GPU points)
    const particlePositions = new Float32Array(particleCount * 3);
    const particleOriginals = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseRadius = 1.35;
    const cyanColor = new THREE.Color(0x38e8ff);
    const deepBlueColor = new THREE.Color(0x0066cc);
    const amberColor = new THREE.Color(0xffaa00);

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

      particleOriginals[i * 3] = x;
      particleOriginals[i * 3 + 1] = y;
      particleOriginals[i * 3 + 2] = z;

      // Color mix: Mostly cyan/ice-blue with 4% amber warning accents
      const isAmber = Math.random() < 0.04;
      const col = isAmber
        ? amberColor
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

    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.024 : 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    arcCoreGroup.add(particlePoints);

    // 4. Three Counter-Rotating Torus Rings with Segmented Tick Marks
    function createSegmentedRing(radius: number, tube: number, segments: number, color: number) {
      const ringGroup = new THREE.Group();

      // Smooth base ring
      const torusGeo = new THREE.TorusGeometry(radius, tube, 8, 80);
      const torusMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        wireframe: true,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      ringGroup.add(torusMesh);

      // Segmented tick marks along perimeter
      for (let s = 0; s < segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        const tickGeo = new THREE.BoxGeometry(0.015, 0.06, 0.02);
        const tickMat = new THREE.MeshBasicMaterial({
          color: s % 4 === 0 ? 0xffaa00 : color,
          transparent: true,
          opacity: 0.85,
        });
        const tickMesh = new THREE.Mesh(tickGeo, tickMat);
        tickMesh.position.x = radius * Math.cos(angle);
        tickMesh.position.y = radius * Math.sin(angle);
        tickMesh.rotation.z = angle;
        ringGroup.add(tickMesh);
      }

      return ringGroup;
    }

    // Inner Ring
    const ring1 = createSegmentedRing(1.5, 0.012, 32, 0x38e8ff);
    arcCoreGroup.add(ring1);

    // Middle Ring
    const ring2 = createSegmentedRing(1.85, 0.014, 48, 0x00f0ff);
    ring2.rotation.x = Math.PI / 4;
    arcCoreGroup.add(ring2);

    // Outer Ring
    const ring3 = createSegmentedRing(2.15, 0.012, 64, 0x0088ff);
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
        float fresnel = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 3.0);
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
    const fresnelSphere = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 32), fresnelMat);
    arcCoreGroup.add(fresnelSphere);

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

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isTabVisible) return;

      const elapsed = clock.getElapsedTime();
      const state = visualStateRef.current;

      // Extract real audio amplitude if analyser exists
      let computedAudio = audioLevelRef.current;
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

      // Counter-rotating rings
      const rotSpeed = 0.01 * ringSpeedMultiplier;
      ring1.rotation.z += rotSpeed;
      ring1.rotation.x += rotSpeed * 0.4;

      ring2.rotation.z -= rotSpeed * 1.25;
      ring2.rotation.y += rotSpeed * 0.6;

      ring3.rotation.y += rotSpeed * 1.4;
      ring3.rotation.x -= rotSpeed * 0.5;

      // Icosahedron rotation & scaling
      icosahedronMesh.rotation.x += rotSpeed * 0.7;
      icosahedronMesh.rotation.y += rotSpeed * 0.9;
      icosahedronMesh.scale.setScalar(coreScale);
      innerCoreMesh.scale.setScalar(coreScale * 0.9);

      // Particle Displacement Update
      const positions = particleGeometry.attributes.position.array as Float32Array;
      const count = particlePositions.length / 3;
      const waveFreq = elapsed * 3.0;

      for (let i = 0; i < count; i++) {
        const ox = particleOriginals[i * 3];
        const oy = particleOriginals[i * 3 + 1];
        const oz = particleOriginals[i * 3 + 2];

        let disp = particlePulse;
        if (state === 'speaking' || state === 'listening') {
          // Radial wave ripples along latitude
          const ripple = Math.sin(oy * 5.0 + waveFreq) * (0.05 + computedAudio * 0.18);
          disp += ripple;
        }

        positions[i * 3] = ox * disp;
        positions[i * 3 + 1] = oy * disp;
        positions[i * 3 + 2] = oz * disp;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Global subtle tilt toward mouse/neutral
      arcCoreGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.15;
      arcCoreGroup.rotation.x = Math.cos(elapsed * 0.3) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      icosahedronGeo.dispose();
      icosahedronMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      fresnelMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative pointer-events-none select-none overflow-hidden"
    />
  );
};
