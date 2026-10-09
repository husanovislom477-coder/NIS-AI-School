import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * HeroThreeScene:
 * Tasteful, lightweight, and performant Three.js 3D educational & technology visual.
 * Visual language: NIS AI School Blue (#0066cc) + Sky Blue (#38a5f6) + Clean White.
 * Features:
 * - Floating low-poly geometric educational nodes (Icosahedron, Dodecahedron, Octahedron)
 * - Subtle digital network constellation of glowing points
 * - Smooth lerped cursor interaction
 * - Strict resource disposal on unmount & devicePixelRatio optimization (max 1.5)
 * - Pauses automatically when tab is hidden or prefers-reduced-motion is active.
 */
export default function HeroThreeScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    // 2. WebGL Renderer with capped DPR for maximum 60fps performance
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0); // Transparent
    container.appendChild(renderer.domElement);

    // 3. Clean Lighting (Soft ambient + subtle directional NIS blue accent)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0066cc, 2.5);
    keyLight.position.set(10, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38a5f6, 1.2);
    fillLight.position.set(-10, -6, 8);
    scene.add(fillLight);

    // 4. Floating Geometric Educational & AI Nodes
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Materials
    const blueMaterial = new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      roughness: 0.25,
      metalness: 0.15,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });

    const skyMaterial = new THREE.MeshStandardMaterial({
      color: 0x38a5f6,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.4,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066cc,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });

    // Create 8 lightweight geometric shapes positioned in a gentle 3D arc
    const geometries = [
      new THREE.IcosahedronGeometry(0.9, 0),
      new THREE.DodecahedronGeometry(0.75, 0),
      new THREE.OctahedronGeometry(0.85, 0),
      new THREE.TetrahedronGeometry(0.7, 0),
      new THREE.IcosahedronGeometry(0.65, 0),
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.DodecahedronGeometry(0.6, 0),
      new THREE.IcosahedronGeometry(0.8, 0),
    ];

    const nodePositions = [
      { x: 5.5, y: 2.8, z: -2, speed: 0.8, mat: blueMaterial },
      { x: 7.2, y: -1.5, z: 0, speed: 1.1, mat: skyMaterial },
      { x: 3.8, y: -3.2, z: -1, speed: 0.9, mat: blueMaterial },
      { x: 6.8, y: 0.8, z: -3, speed: 1.2, mat: wireframeMaterial },
      { x: -5.8, y: 3.2, z: -3, speed: 0.7, mat: skyMaterial },
      { x: -7.0, y: -2.0, z: -1, speed: 1.0, mat: blueMaterial },
      { x: 4.8, y: 4.0, z: -4, speed: 0.85, mat: wireframeMaterial },
      { x: 8.5, y: -3.0, z: -2, speed: 1.15, mat: skyMaterial },
    ];

    const meshes = nodePositions.map((cfg, index) => {
      const geo = geometries[index % geometries.length];
      const mesh = new THREE.Mesh(geo, cfg.mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.userData = {
        baseY: cfg.y,
        baseX: cfg.x,
        speed: cfg.speed,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
      };
      mainGroup.add(mesh);
      return mesh;
    });

    // 5. Constellation Network: Points & Thin Interconnecting Lines
    const particleCount = 45;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x0066cc,
      size: 0.12,
      transparent: true,
      opacity: 0.35,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // 6. Smooth Mouse Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = normX * 0.35;
      targetY = normY * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    };

    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / group rotation lerp based on cursor position
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      mainGroup.rotation.y = currentX * 0.5 + Math.sin(elapsedTime * 0.12) * 0.05;
      mainGroup.rotation.x = -currentY * 0.4 + Math.cos(elapsedTime * 0.1) * 0.04;

      // Animate individual geometric nodes with calm floating bobbing
      meshes.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;
        mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * mesh.userData.speed) * 0.25;
      });

      // Subtle slow rotation of background constellation
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 9. Comprehensive Cleanup & Resource Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      // Dispose Geometries
      geometries.forEach((g) => g.dispose());
      particleGeometry.dispose();

      // Dispose Materials
      blueMaterial.dispose();
      skyMaterial.dispose();
      wireframeMaterial.dispose();
      particleMaterial.dispose();

      // Clear scene and renderer
      scene.clear();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-[1] overflow-hidden opacity-90 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
}
