import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function generateRealisticLeaf(count: number): { positions: Float32Array; colors: Float32Array; sizes: Float32Array } {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const leafParticles = Math.floor(count * 0.94);
    const stemParticles = count - leafParticles;

    for (let i = 0; i < leafParticles; i++) {
        const t = Math.random();
        const leafLength = 2.4;
        const y = (t - 0.42) * leafLength;

        // Realistic leaf width profile
        const widthProfile = Math.pow(Math.sin(t * Math.PI), 0.8) * (1 - Math.pow(Math.abs(t - 0.45), 2) * 0.5);
        const maxWidth = widthProfile * 1.0;

        if (maxWidth < 0.02) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = -100;
            positions[i * 3 + 2] = 0;
            sizes[i] = 0;
            continue;
        }

        const side = Math.random() > 0.5 ? 1 : -1;
        const xRandom = Math.pow(Math.random(), 0.6);
        const xOffset = xRandom * maxWidth * side;

        // Vein structure
        const distFromCenter = Math.abs(xOffset);
        const isMainVein = distFromCenter < 0.04;
        const isSecondaryVein = Math.abs(Math.sin(t * 12 + xOffset * 5)) < 0.15;
        const veinDensity = isMainVein ? 1 : (isSecondaryVein ? 0.85 : 0.55);

        if (Math.random() < veinDensity) {
            // Natural 3D curvature
            const mainCurve = Math.sin(t * Math.PI) * 0.18;
            const edgeCurl = Math.pow(distFromCenter / maxWidth, 2) * 0.12 * (t > 0.5 ? 1 : 0.5);
            const microDetail = (Math.random() - 0.5) * 0.03;

            positions[i * 3] = xOffset;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = mainCurve * (1 - distFromCenter / maxWidth * 0.5) - edgeCurl + microDetail;

            // Rich color variations
            const colorType = Math.random();
            const brightness = 0.7 + Math.random() * 0.3;
            const centerFade = 1 - distFromCenter / maxWidth * 0.3;
            const tipFade = t > 0.75 ? 1 - (t - 0.75) * 1.5 : 1;
            const baseFade = t < 0.15 ? 0.7 + t * 2 : 1;
            const fade = centerFade * tipFade * baseFade;

            if (colorType < 0.5) {
                // Deep emerald
                colors[i * 3] = 0.05 * brightness * fade;
                colors[i * 3 + 1] = (0.45 + Math.random() * 0.2) * brightness * fade;
                colors[i * 3 + 2] = 0.15 * brightness * fade;
            } else if (colorType < 0.75) {
                // Bright green
                colors[i * 3] = 0.1 * brightness * fade;
                colors[i * 3 + 1] = (0.6 + Math.random() * 0.25) * brightness * fade;
                colors[i * 3 + 2] = 0.2 * brightness * fade;
            } else if (colorType < 0.9) {
                // Yellow-green highlights
                colors[i * 3] = 0.2 * brightness * fade;
                colors[i * 3 + 1] = (0.55 + Math.random() * 0.3) * brightness * fade;
                colors[i * 3 + 2] = 0.1 * brightness * fade;
            } else {
                // Dark forest green shadows
                colors[i * 3] = 0.02 * brightness * fade;
                colors[i * 3 + 1] = (0.3 + Math.random() * 0.15) * brightness * fade;
                colors[i * 3 + 2] = 0.08 * brightness * fade;
            }

            // Varied sizes for texture
            if (isMainVein) {
                sizes[i] = 0.022 + Math.random() * 0.01;
            } else if (isSecondaryVein) {
                sizes[i] = 0.016 + Math.random() * 0.008;
            } else {
                sizes[i] = 0.01 + Math.random() * 0.012;
            }
        } else {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = -100;
            positions[i * 3 + 2] = 0;
            sizes[i] = 0;
        }
    }

    // Stem - connected at the base of the leaf
    const stemStartY = -1.0;
    for (let i = leafParticles; i < count; i++) {
        const t = (i - leafParticles) / stemParticles;
        const stemLength = 0.8;
        const stemY = stemStartY - t * stemLength;

        // Tapered stem
        const stemRadius = 0.045 * (1 - t * 0.6);
        const angle = Math.random() * Math.PI * 2;
        const radiusVariation = 0.7 + Math.random() * 0.3;

        positions[i * 3] = Math.cos(angle) * stemRadius * radiusVariation;
        positions[i * 3 + 1] = stemY;
        positions[i * 3 + 2] = Math.sin(angle) * stemRadius * 0.6 * radiusVariation;

        // Brown-green gradient for stem
        const stemBrightness = 0.5 + Math.random() * 0.3;
        const greenMix = 1 - t * 0.7;
        colors[i * 3] = (0.12 + t * 0.08) * stemBrightness;
        colors[i * 3 + 1] = (0.25 + greenMix * 0.15) * stemBrightness;
        colors[i * 3 + 2] = 0.08 * stemBrightness;

        sizes[i] = 0.025 + Math.random() * 0.015;
    }

    return { positions, colors, sizes };
}

function createSoftCircle(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

interface ParticlesProps {
    isHovered: boolean;
    mousePosition: { x: number; y: number };
    containerRect: DOMRect | null;
}

function Particles({ isHovered, mousePosition, containerRect }: ParticlesProps) {
    const particleCount = 22000;
    const pointsRef = useRef<THREE.Points>(null);
    const originalPositions = useRef<Float32Array | null>(null);
    const velocities = useRef<Float32Array | null>(null);
    const time = useRef(0);
    const { camera } = useThree();

    const { positions, colors, sizes } = useMemo(() => generateRealisticLeaf(particleCount), []);
    const circleTexture = useMemo(() => createSoftCircle(), []);

    useEffect(() => {
        originalPositions.current = new Float32Array(positions);
        velocities.current = new Float32Array(particleCount * 3).fill(0);
    }, [positions]);

    useFrame((state, delta) => {
        if (!pointsRef.current || !originalPositions.current || !velocities.current) return;

        time.current += delta;
        const positionAttribute = pointsRef.current.geometry.attributes.position;
        const currentPositions = positionAttribute.array as Float32Array;

        // Mouse to 3D
        let mouse3D = new THREE.Vector3(0, 0, 0);
        if (containerRect && isHovered) {
            const relativeX = mousePosition.x - containerRect.left;
            const relativeY = mousePosition.y - containerRect.top;
            const ndcX = (relativeX / containerRect.width) * 2 - 1;
            const ndcY = -((relativeY / containerRect.height) * 2 - 1);

            const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            mouse3D = camera.position.clone().add(dir.multiplyScalar(distance));
        }

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const ox = originalPositions.current[i3];
            const oy = originalPositions.current[i3 + 1];
            const oz = originalPositions.current[i3 + 2];

            if (oy < -50) continue;

            const cx = currentPositions[i3];
            const cy = currentPositions[i3 + 1];
            const cz = currentPositions[i3 + 2];

            // Wave animation
            const waveTime = time.current * 1.2;
            const waveX = Math.sin(waveTime + oy * 1.5) * 0.02 * (1 + Math.abs(ox) * 0.8);
            const waveY = Math.cos(waveTime * 0.8 + ox * 2) * 0.008;
            const waveZ = Math.sin(waveTime * 0.6 + oy + ox) * 0.015;

            // Ripple from bottom to top
            const ripplePhase = waveTime * 2 - oy * 3;
            const ripple = Math.sin(ripplePhase) * 0.01 * Math.max(0, 1 - oy * 0.5);

            const targetX = ox + waveX + ripple;
            const targetY = oy + waveY;
            const targetZ = oz + waveZ;

            if (isHovered && containerRect) {
                const dx = cx - mouse3D.x;
                const dy = cy - mouse3D.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const repelRadius = 0.5;
                if (dist < repelRadius && dist > 0.001) {
                    const falloff = Math.pow((repelRadius - dist) / repelRadius, 1.5);
                    const force = falloff * 0.06;

                    velocities.current[i3] += (dx / dist) * force;
                    velocities.current[i3 + 1] += (dy / dist) * force;
                    velocities.current[i3 + 2] += (Math.random() - 0.5) * force * 0.4;

                    // Swirl
                    velocities.current[i3] += -dy / dist * 0.01 * falloff;
                    velocities.current[i3 + 1] += dx / dist * 0.01 * falloff;
                }
            }

            // Spring back
            const springStrength = isHovered ? 0.025 : 0.05;
            velocities.current[i3] += (targetX - cx) * springStrength;
            velocities.current[i3 + 1] += (targetY - cy) * springStrength;
            velocities.current[i3 + 2] += (targetZ - cz) * springStrength;

            // Damping
            const damping = 0.9;
            velocities.current[i3] *= damping;
            velocities.current[i3 + 1] *= damping;
            velocities.current[i3 + 2] *= damping;

            currentPositions[i3] += velocities.current[i3];
            currentPositions[i3 + 1] += velocities.current[i3 + 1];
            currentPositions[i3 + 2] += velocities.current[i3 + 2];
        }

        positionAttribute.needsUpdate = true;

        // Gentle sway
        pointsRef.current.rotation.y = Math.sin(time.current * 0.2) * 0.06;
        pointsRef.current.rotation.z = Math.sin(time.current * 0.15) * 0.03;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={particleCount} array={sizes} itemSize={1} />
            </bufferGeometry>
            <pointsMaterial
                size={0.028}
                vertexColors
                transparent
                opacity={0.92}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                map={circleTexture}
                alphaMap={circleTexture}
            />
        </points>
    );
}

export default function ParticleLeaf() {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateRect = () => {
            if (containerRef.current) {
                setContainerRect(containerRef.current.getBoundingClientRect());
            }
        };
        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    }, []);

    useEffect(() => {
        if (isHovered) {
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [isHovered, handleMouseMove]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Canvas
                camera={{ position: [0, 0, 3.5], fov: 50 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.3} />
                <pointLight position={[2, 2, 4]} intensity={0.6} color="#4ade80" />
                <pointLight position={[-2, -1, 3]} intensity={0.3} color="#22c55e" />
                <Particles isHovered={isHovered} mousePosition={mousePosition} containerRect={containerRect} />
            </Canvas>
        </div>
    );
}
