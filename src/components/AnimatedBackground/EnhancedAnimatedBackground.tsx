import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

interface ParticleSystem {
  mesh: THREE.Points
  velocities: Float32Array
  originalPositions: Float32Array
}

export const EnhancedAnimatedBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const frameId = useRef<number>()
  const mousePosition = useRef({ x: 0, y: 0 })
  const scrollProgress = useRef(0)
  const [isInteracting, setIsInteracting] = useState(false)

  // Track scroll for parallax effect
  const handleScroll = useCallback(() => {
    scrollProgress.current = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
  }, [])

  // Track mouse for interaction effects
  const handleMouseMove = useCallback((event: MouseEvent) => {
    mousePosition.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1
    }
    setIsInteracting(true)
    
    // Reset interaction state after a delay
    setTimeout(() => setIsInteracting(false), 100)
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup with enhanced renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Create multiple particle systems for depth
    const particleSystems: ParticleSystem[] = []
    const particleLayers = [
      { count: 150, size: 0.03, color: 0x4f46e5, depth: 5 },
      { count: 100, size: 0.05, color: 0x7c3aed, depth: 3 },
      { count: 50, size: 0.08, color: 0xec4899, depth: 2 }
    ]

    particleLayers.forEach((layer, layerIndex) => {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(layer.count * 3)
      const velocities = new Float32Array(layer.count * 3)
      const originalPositions = new Float32Array(layer.count * 3)

      // Generate particles with different depth layers
      for (let i = 0; i < layer.count * 3; i += 3) {
        const x = (Math.random() - 0.5) * 20
        const y = (Math.random() - 0.5) * 20
        const z = (Math.random() - 0.5) * layer.depth

        positions[i] = x
        positions[i + 1] = y
        positions[i + 2] = z

        originalPositions[i] = x
        originalPositions[i + 1] = y
        originalPositions[i + 2] = z

        velocities[i] = (Math.random() - 0.5) * 0.01
        velocities[i + 1] = (Math.random() - 0.5) * 0.01
        velocities[i + 2] = (Math.random() - 0.5) * 0.005
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const material = new THREE.PointsMaterial({
        size: layer.size,
        color: layer.color,
        transparent: true,
        opacity: 0.6 - (layerIndex * 0.1),
        blending: THREE.AdditiveBlending,
        vertexColors: false
      })

      const mesh = new THREE.Points(geometry, material)
      scene.add(mesh)

      particleSystems.push({
        mesh,
        velocities,
        originalPositions
      })
    })

    // Create interactive geometric shapes
    const shapes: THREE.Mesh[] = []
    const shapeGeometries = [
      new THREE.TetrahedronGeometry(0.4),
      new THREE.OctahedronGeometry(0.4),
      new THREE.IcosahedronGeometry(0.4),
      new THREE.DodecahedronGeometry(0.4)
    ]

    shapeGeometries.forEach((geometry, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: [0x4f46e5, 0x7c3aed, 0xec4899, 0x06b6d4][index],
        transparent: true,
        opacity: 0.1,
        wireframe: true
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      )
      
      scene.add(mesh)
      shapes.push(mesh)
    })

    camera.position.z = 5

    // Enhanced animation loop with parallax and interactions
    const animate = () => {
      frameId.current = requestAnimationFrame(animate)

      const time = Date.now() * 0.001

      // Parallax camera movement based on scroll
      camera.position.y = scrollProgress.current * 2
      camera.rotation.x = scrollProgress.current * 0.1

      // Mouse interaction effects
      if (isInteracting) {
        camera.position.x += (mousePosition.current.x * 0.5 - camera.position.x) * 0.05
        camera.position.y += (mousePosition.current.y * 0.5 - camera.position.y) * 0.05
      }

      // Animate particle systems with different behaviors per layer
      particleSystems.forEach((system, layerIndex) => {
        const positions = system.mesh.geometry.attributes.position.array as Float32Array
        
        for (let i = 0; i < positions.length; i += 3) {
          // Base floating motion
          positions[i] += system.velocities[i]
          positions[i + 1] += system.velocities[i + 1]
          positions[i + 2] += system.velocities[i + 2]

          // Mouse interaction - particles move away from cursor
          if (isInteracting) {
            const mouseX = mousePosition.current.x * 10
            const mouseY = mousePosition.current.y * 10
            
            const dx = positions[i] - mouseX
            const dy = positions[i + 1] - mouseY
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < 3) {
              const force = (3 - distance) * 0.02
              positions[i] += dx * force
              positions[i + 1] += dy * force
            }
          }

          // Boundary checking with smooth wrapping
          if (positions[i] > 10) positions[i] = -10
          if (positions[i] < -10) positions[i] = 10
          if (positions[i + 1] > 10) positions[i + 1] = -10
          if (positions[i + 1] < -10) positions[i + 1] = 10
          if (positions[i + 2] > 5) positions[i + 2] = -5
          if (positions[i + 2] < -5) positions[i + 2] = 5

          // Subtle wave motion based on time
          positions[i + 1] += Math.sin(time + positions[i] * 0.5) * 0.005 * (layerIndex + 1)
        }

        system.mesh.geometry.attributes.position.needsUpdate = true

        // Rotate the entire particle system
        system.mesh.rotation.y = time * 0.05 * (layerIndex + 1)
        system.mesh.rotation.x = time * 0.02 * (layerIndex + 1)
      })

      // Animate geometric shapes with mouse interaction
      shapes.forEach((shape, index) => {
        // Base rotation
        shape.rotation.x = time * 0.3 * (index + 1)
        shape.rotation.y = time * 0.2 * (index + 1)
        shape.rotation.z = time * 0.1 * (index + 1)

        // Mouse interaction - shapes orbit around cursor
        if (isInteracting) {
          const targetX = mousePosition.current.x * 3
          const targetY = mousePosition.current.y * 3
          
          shape.position.x += (targetX - shape.position.x) * 0.02
          shape.position.y += (targetY - shape.position.y) * 0.02
        }

        // Floating motion
        shape.position.y += Math.sin(time + index) * 0.01
        shape.position.x += Math.cos(time * 0.5 + index) * 0.005
      })

      renderer.render(scene, camera)
    }

    // Event listeners
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Start animation
    animate()

    // Cleanup
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
      
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      // Dispose of Three.js resources
      particleSystems.forEach(system => {
        system.mesh.geometry.dispose()
        const material = system.mesh.material as THREE.Material
        material.dispose()
      })
      
      shapes.forEach(shape => {
        shape.geometry.dispose()
        const material = shape.material as THREE.Material
        material.dispose()
      })
      
      renderer.dispose()
    }
  }, [handleScroll, handleMouseMove, isInteracting])

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        willChange: 'transform'
      }}
    />
  )
}