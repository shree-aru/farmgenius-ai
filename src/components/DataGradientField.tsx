import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    float t = uTime * 0.15;

    float wave1 = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 4.0 - t * 1.3) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 2.5 + t * 0.8) * 0.5 + 0.5;

    vec3 colorA = vec3(0.72, 1.0, 0.17);  // #B8FF2C
    vec3 colorB = vec3(0.0, 1.0, 0.67);   // #00FFAA
    vec3 colorC = vec3(1.0, 0.0, 0.33);   // #FF0055

    float mixFactor1 = wave1 * wave2;
    float mixFactor2 = wave3 * (1.0 - wave1);

    vec3 color = mix(
      mix(colorA, colorB, mixFactor1),
      colorC,
      mixFactor2 * 0.3
    );

    float brightness = 0.4 + 0.3 * sin(uv.y * 2.0 + t) * sin(uv.x * 1.5 - t * 0.5);
    color *= brightness;

    // Vignette
    float dist = length(uv - 0.5);
    float vignette = 1.0 - smoothstep(0.3, 0.9, dist);
    color *= vignette * 0.8;

    gl_FragColor = vec4(color, 1.0);
  }
`

function GradientPlane() {
  const meshRef = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function FloatingText({ position, delay }: { text: string; position: [number, number, number]; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Vector3(0.72, 1.0, 0.17) },
    }),
    []
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + delay) * 0.15
      meshRef.current.rotation.x = Math.sin(t * 0.3 + delay) * 0.05
    }
    uniforms.uTime.value = t
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.5, 0.3, 0.05]} />
      <shaderMaterial
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float glow = 0.5 + 0.5 * sin(uTime * 2.0 + vUv.x * 10.0);
            vec3 color = vec3(0.72, 1.0, 0.17) * (0.3 + glow * 0.4);
            gl_FragColor = vec4(color, 0.6);
          }
        `}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

export default function DataGradientField() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#000000' }}
      >
        <GradientPlane />
        <FloatingText text="DATA" position={[-1.5, 0.8, -1]} delay={0} />
        <FloatingText text="GROWTH" position={[1.2, 0.3, -1.5]} delay={1} />
        <FloatingText text="YIELD" position={[0, -0.5, -1.2]} delay={2} />
      </Canvas>
    </div>
  )
}
