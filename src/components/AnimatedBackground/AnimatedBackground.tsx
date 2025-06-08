import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const AnimatedBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const frameId = useRef<number>()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 100
    const posArray = new Float32Array(particlesCount * 3)

    // Generate random positions for particles
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

    // Create gradient material for particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Create geometric shapes
    const geometries = [
      new THREE.TetrahedronGeometry(0.3),
      new THREE.OctahedronGeometry(0.3),
      new THREE.IcosahedronGeometry(0.3)
    ]

    const shapes: THREE.Mesh[] = []
    
    for (let i = 0; i < 8; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)]
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
        wireframe: true,
        transparent: true,
        opacity: 0.3
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      )
      
      shapes.push(mesh)
      scene.add(mesh)
    }

    camera.position.z = 5

    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate)

      // Rotate particles
      particlesMesh.rotation.y += 0.001
      particlesMesh.rotation.x += 0.0005

      // Animate geometric shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.01 + index * 0.002
        shape.rotation.y += 0.01 + index * 0.001
        
        // Floating motion
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    />
  )
}