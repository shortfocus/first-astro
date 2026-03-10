import * as React from "react";
import * as THREE from "three";

const ROTATION_MAX = 0.6;
const LERP = 0.14;
const INIT_ROTATION_X = -0.42;
const INIT_ROTATION_Y = 0.48;

// 블록 한 개 크기 (정육면체)
const BLOCK_SIZE = 0.12;

// 조립될 형태: 정육면체 그리드 (6x6x6)
const GRID_SIZE = 6;
const HALF = (GRID_SIZE - 1) * 0.5;

/** 3D 그리드에서 정육면체 형태의 블록 위치 생성 (중심 0,0,0) */
function buildBlockPositions(): [number, number, number][] {
  const positions: [number, number, number][] = [];
  const spacing = BLOCK_SIZE * 1.08;

  for (let ix = 0; ix < GRID_SIZE; ix++) {
    for (let iy = 0; iy < GRID_SIZE; iy++) {
      for (let iz = 0; iz < GRID_SIZE; iz++) {
        const x = (ix - HALF) * spacing;
        const y = (iy - HALF) * spacing;
        const z = (iz - HALF) * spacing;
        positions.push([x, y, z]);
      }
    }
  }
  return positions;
}

const BLOCK_POSITIONS = buildBlockPositions();

const ASSEMBLE_DELAY = 1; // 프레임 간격으로 블록 하나씩 조립
const POSITION_LERP = 0.1; // 목표 위치로 이동 속도
const SCALE_LERP = 0.15; // 크기 커지는 속도
const HOLD_FRAMES = 90; // 조립 완료 후 유지할 프레임 수 (~1.5초)

export default function HeroCanvas() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<number>(0);
  const targetRotationRef = React.useRef({ x: INIT_ROTATION_X, y: INIT_ROTATION_Y });
  const currentRotationRef = React.useRef({ x: INIT_ROTATION_X, y: INIT_ROTATION_Y });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 2.2;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);

    const blockGeometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const blockMaterial = new THREE.MeshLambertMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const blocksGroup = new THREE.Group();

    type BlockState = {
      mesh: THREE.Mesh;
      targetPos: THREE.Vector3;
      startPos: THREE.Vector3;
      currentPos: THREE.Vector3;
      currentScale: number;
      active: boolean;
    };

    const blocks: BlockState[] = BLOCK_POSITIONS.map(([tx, ty, tz], i) => {
      const mesh = new THREE.Mesh(blockGeometry, blockMaterial);
      const targetPos = new THREE.Vector3(tx, ty, tz);
      const angle = (i / BLOCK_POSITIONS.length) * Math.PI * 2;
      const radius = 1.2 + (i % 3) * 0.2;
      const startX = Math.cos(angle) * radius * 0.6;
      const startZ = Math.sin(angle) * radius * 0.6;
      const startY = -0.4 - (i % 5) * 0.15;
      const startPos = new THREE.Vector3(startX, startY, startZ);
      mesh.position.set(startX, startY, startZ);
      mesh.scale.setScalar(0.001);
      blocksGroup.add(mesh);
      return {
        mesh,
        targetPos,
        startPos,
        currentPos: startPos.clone(),
        currentScale: 0.001,
        active: false,
      };
    });

    function resetBlocks() {
      blocks.forEach((block) => {
        block.currentPos.copy(block.startPos);
        block.mesh.position.copy(block.startPos);
        block.currentScale = 0.001;
        block.mesh.scale.setScalar(0.001);
        block.active = false;
      });
    }

    scene.add(blocksGroup);

    const light = new THREE.DirectionalLight(0xffffff, 0.85);
    light.position.set(0.5, 0.5, 1);
    scene.add(light);
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetRotationRef.current.y = INIT_ROTATION_Y + (x - 0.5) * 2 * ROTATION_MAX;
      targetRotationRef.current.x = INIT_ROTATION_X + (0.5 - y) * 2 * ROTATION_MAX;
    };

    const onMouseLeave = () => {
      targetRotationRef.current.x = INIT_ROTATION_X;
      targetRotationRef.current.y = INIT_ROTATION_Y;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    let frameCount = 0;
    let holdCount = 0;
    const totalAssembleFrames = BLOCK_POSITIONS.length * ASSEMBLE_DELAY + 60;

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      frameCount += 1;

      const target = targetRotationRef.current;
      const current = currentRotationRef.current;
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;

      blocksGroup.rotation.x = current.x;
      blocksGroup.rotation.y = current.y;

      if (holdCount > 0) {
        holdCount -= 1;
        if (holdCount === 0) {
          resetBlocks();
          frameCount = 0;
        }
      } else {
        const nextBlockIndex = Math.floor(frameCount / ASSEMBLE_DELAY);
        blocks.forEach((block, i) => {
          if (i < nextBlockIndex) block.active = true;
          else if (i === nextBlockIndex) block.active = true;

          if (block.active) {
            block.currentPos.lerp(block.targetPos, POSITION_LERP);
            block.mesh.position.copy(block.currentPos);
            block.currentScale += (1 - block.currentScale) * SCALE_LERP;
            block.mesh.scale.setScalar(block.currentScale);
          }
        });

        if (frameCount >= totalAssembleFrames && holdCount === 0) {
          holdCount = HOLD_FRAMES;
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
      blockGeometry.dispose();
      blockMaterial.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[18rem] cursor-default rounded-2xl overflow-hidden"
      aria-hidden="true"
    />
  );
}
