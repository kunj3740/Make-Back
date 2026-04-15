import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import {
   Sparkles, Rocket, Zap, Shield, Brain, Database, Code,
  ChevronDown, Menu, X, Github, Twitter, MessageCircle as Discord
} from "lucide-react"
import { motion, useScroll, useSpring } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { 
  Sphere, 
  Stars, 
  Float, 
  Text
} from "@react-three/drei"
import * as THREE from 'three'


/* ─── Design Tokens & Styles ───────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

    :root {
      --bg: #030305;
      --accent: #a855f7;
      --accent-glow: rgba(168, 85, 247, 0.5);
      --font-sans: 'Inter', sans-serif;
      --font-display: 'Space Grotesk', sans-serif;
      --font-serif: 'Playfair Display', serif;
    }

    body {
      background-color: var(--bg);
      color: #fff;
      font-family: var(--font-sans);
      margin: 0;
      overflow-x: hidden;
    }

    .glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .text-glow {
      text-shadow: 0 0 20px var(--accent-glow);
    }

    .btn-primary {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
      transition: all 0.3s ease;
      border: none;
      color: white;
      cursor: pointer;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 40px rgba(168, 85, 247, 0.5);
    }

    /* Hide scrollbar but keep functionality */
    ::-webkit-scrollbar { width: 0px; background: transparent; }

    .noise {
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      opacity: 0.02; mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .label {
      font-family: var(--font-display);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .font-serif {
      font-family: var(--font-serif);
    }
  `}</style>
)

/* ─── 3D Components ────────────────────────────────────────────────── */

const Planet = ({ 
  position, 
  color, 
  emissive, 
  scale = 1, 
  title, 
  textureUrl, 
  bumpUrl, 
  normalUrl, 
  specUrl, 
  cloudUrl,
  emissiveMapUrl,
  normalScale = 1.5,
  bumpScale = 0.05,
  scrollProgress
}) => {
  const meshRef = useRef(null)
  const cloudRef = useRef(null)
  const lightRef = useRef(null)
  const matRef = useRef(null)
  const textMatRef = useRef(null)
  const [textures, setTextures] = useState({ map: null, bump: null, normal: null, spec: null, clouds: null, emissive: null })
  
  const planetPos = useMemo(() => {
    if (Array.isArray(position)) return new THREE.Vector3(...position)
    return new THREE.Vector3(0, 0, 0)
  }, [position])

  const nScale = useMemo(() => new THREE.Vector2(normalScale, normalScale), [normalScale])

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const loadTexture = (url, key) => {
      if (!url) return
      loader.load(
        url,
        (tex) => {
          tex.anisotropy = 16
          setTextures(prev => ({ ...prev, [key]: tex }))
        },
        undefined,
        (err) => console.warn(`Failed to load texture: ${url}`, err)
      )
    }
    loadTexture(textureUrl, 'map')
    loadTexture(bumpUrl, 'bump')
    loadTexture(normalUrl, 'normal')
    loadTexture(specUrl, 'spec')
    loadTexture(cloudUrl, 'clouds')
    loadTexture(emissiveMapUrl, 'emissive')
  }, [textureUrl, bumpUrl, normalUrl, specUrl, cloudUrl, emissiveMapUrl])
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05
      meshRef.current.rotation.z = t * 0.02
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = t * 0.07
      cloudRef.current.rotation.z = t * 0.03
    }

    // Dynamic illumination based on distance
    const dist = state.camera.position.distanceTo(planetPos)
    const proximity = 1 - THREE.MathUtils.smoothstep(dist, 5, 25)
    
    if (lightRef.current) {
      lightRef.current.intensity = 10 + (proximity * 150)
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.1 + (proximity * 0.4)
    }
    if (textMatRef.current && scrollProgress) {
      textMatRef.current.opacity = 0.2 + THREE.MathUtils.smoothstep(scrollProgress.get(), 0, 0.05) * 0.8
    }
  })

  return (
    <group position={position}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        {/* Internal Core Glow */}
        <pointLight ref={lightRef} color={emissive} intensity={20} distance={scale * 10} />
        
        {/* Main Planet Body */}
        <Sphere ref={meshRef} args={[scale, 128, 128]}>
          <meshStandardMaterial 
            ref={matRef}
            map={textures.map}
            normalMap={textures.normal}
            normalScale={nScale}
            bumpMap={textures.bump}
            bumpScale={bumpScale}
            roughnessMap={textures.spec}
            emissiveMap={textures.emissive}
            color={color}
            emissive={emissive}
            emissiveIntensity={0.4}
            roughness={0.8}
            metalness={0.1}
          />
        </Sphere>
        
        {/* Clouds Layer */}
        {textures.clouds && (
          <Sphere ref={cloudRef} args={[scale * 1.02, 128, 128]}>
            <meshStandardMaterial 
              map={textures.clouds}
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </Sphere>
        )}
        
        {/* Atmospheric Rim Glow */}
        <Sphere args={[scale * 1.1, 64, 64]}>
          <meshPhongMaterial 
            color={emissive} 
            transparent 
            opacity={0.15} 
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>

        {/* Labels in 3D Space */}
        <Text
          position={[0, scale + 1.5, 0]}
          fontSize={0.6}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor={emissive}
        >
          {title}
          {scrollProgress && (
            <meshBasicMaterial 
              ref={textMatRef}
              transparent 
              opacity={0.2} 
            />
          )}
        </Text>
      </Float>
    </group>
  )
}

const CameraPath = ({ scrollProgress }) => {
  const { camera } = useThree()
  const spotLightRef = useRef(null)
  const [target] = useState(() => new THREE.Object3D())
  
  // Define a curved path through space
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 15),    // Start
      new THREE.Vector3(0, 0, 5),     // Approach Planet 1
      new THREE.Vector3(8, 2, -5),    // Turn Right / Orbit
      new THREE.Vector3(20, 0, -20),  // Travel to Planet 2
      new THREE.Vector3(15, -5, -35), // Curve Down
      new THREE.Vector3(-10, 0, -50), // Travel to Planet 3
      new THREE.Vector3(0, 0, -70),   // Final Destination
    ])
  }, [])

  const lookAtCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),     // Look at Planet 1
      new THREE.Vector3(0, 0, 0),     
      new THREE.Vector3(20, 0, -20),  // Look at Planet 2
      new THREE.Vector3(20, 0, -20),
      new THREE.Vector3(-10, 0, -50), // Look at Planet 3
      new THREE.Vector3(-10, 0, -50),
      new THREE.Vector3(0, 0, -100),  // Look into Void
    ])
  }, [])

  const planetPositions = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(20, 0, -20),
    new THREE.Vector3(-10, 0, -50),
  ], [])

  useFrame(() => {
    const t = scrollProgress.get()
    if (isNaN(t)) return

    const pos = curve.getPointAt(t)
    const lookAtPos = lookAtCurve.getPointAt(t)
    
    if (pos) camera.position.lerp(pos, 0.1)
    if (lookAtPos) camera.lookAt(lookAtPos)

    if (spotLightRef.current && lookAtPos) {
      spotLightRef.current.position.copy(camera.position)
      target.position.copy(lookAtPos)

      // Calculate distance to nearest planet
      let minDistance = Infinity
      planetPositions.forEach(p => {
        if (p) {
          const dist = camera.position.distanceTo(p)
          if (dist < minDistance) minDistance = dist
        }
      })

      // Proximity factor: 1 when close (<5), 0 when far (>20)
      const proximity = 1 - THREE.MathUtils.smoothstep(minDistance, 5, 20)

      // Dynamic spotlight behavior
      // 1. Intensity: Dims slightly when close to avoid washing out textures, but stays localized
      spotLightRef.current.intensity = (0.2 + (1 - proximity) * 0.8) * 400
      
      // 2. Angle: Becomes narrower (more localized) when close
      spotLightRef.current.angle = 0.6 - (proximity * 0.35) // Narrows from 0.6 to 0.25
      
      // 3. Penumbra: Becomes sharper when close
      spotLightRef.current.penumbra = 0.8 - (proximity * 0.4)
    }
  })

  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={spotLightRef}
        target={target}
        intensity={400}
        distance={100}
        angle={0.6}
        penumbra={0.8}
        color="#ffffff"
      />
    </>
  )
}

const Scene = ({ scrollProgress }) => {
  return (
    <>
      <CameraPath scrollProgress={scrollProgress} />
      
      {/* Ambient Cosmic Light */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={5} color="#a855f7" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#3b82f6" />

      {/* Planets positioned along the journey */}
      <Planet 
        position={[0, 0, 0]} 
        color="#332d3d" 
        emissive="#a855f7" 
        scale={2.5} 
        title="GENESIS"
        scrollProgress={scrollProgress}
        textureUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_atmos_2048.jpg"
        normalUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_normal_2048.jpg"
        specUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_specular_2048.jpg"
        cloudUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_clouds_1024.png"
        emissiveMapUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_lights_2048.png"
        normalScale={1.2}
      />
      
      <Planet 
        position={[20, 0, -20]} 
        color="#3b82f6" 
        emissive="#1d4ed8" 
        scale={3.5} 
        title="SYNTHESIS"
        textureUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/moon_1024.jpg"
        normalUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_normal_2048.jpg"
        bumpUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/moon_1024.jpg"
        specUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/moon_1024.jpg"
        cloudUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_clouds_1024.png"
        bumpScale={0.15}
        normalScale={2.0}
      />

      <Planet 
        position={[-15, 0, -50]} 
        color="#6ee7b7" 
        emissive="#059669" 
        scale={3.5} 
        title="MANIFEST"
        textureUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_day_4096.jpg"
        normalUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_normal_2048.jpg"
        bumpUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_bump_roughness_clouds_4096.jpg"
        specUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_specular_2048.jpg"
        cloudUrl="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_clouds_1024.png"
        bumpScale={0.3}
        normalScale={3.5}
      />
    </>
  )
}



const Section = ({ children, id, className = "" }) => {
  return (
    <section id={id} className={`min-h-screen flex items-center px-6 relative ${className}`}>
      <div className="max-w-4xl mx-auto w-full">
        {children}
      </div>
    </section>
  )
}

/* ─── Main Application ─────────────────────────────────────────────── */

export default function App() {
  const containerRef = useRef(null)
  const [manifestInput, setManifestInput] = useState("")
  const [isManifesting, setIsManifesting] = useState(false)
  const navigate = useNavigate()

  const handleManifest = () => {
    if (!manifestInput) return
    setIsManifesting(true)
    
    const token = localStorage.getItem("token")
    if (token) {
      navigate(`/projects?manifest=${encodeURIComponent(manifestInput)}`)
    } else {
      navigate("/signin")
    }
    
    setTimeout(() => setIsManifesting(false), 2000)
  }

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Smooth scroll progress for the 3D scene
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  })

  return (
      <div ref={containerRef} className="relative">
        <Styles />
        <div className="noise" />

        {/* 3D Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Canvas dpr={[1, 2]}>
            <color attach="background" args={["#030305"]} />
            <Stars radius={100} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
            <Suspense fallback={null}>
              <Scene scrollProgress={smoothProgress} />
            </Suspense>
          </Canvas>
        </div>

        {/* Content Layer */}
        <main className="relative z-10">
          
          {/* Hero Section */}
          <Section id="mission">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center"
            >
              <span className="label mb-6 block">LET'S BUILD</span>
              <h1 className="text-6xl md:text-[140px] font-display font-black tracking-tighter mb-8 text-glow leading-[0.8] mt-[100px]">
                Build <span className="font-serif italic font-medium text-accent">Backends</span> <br />
                Intelligently.
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                The world's first context-aware backend generator. Design your schema visually, and let our neural engine manifest production-ready APIs in real-time.
              </p>
              
              <div className="max-w-2xl mx-auto mb-12">
                <div className="glass p-2 rounded-full flex items-center gap-4 pl-6">
                  <input 
                    type="text" 
                    value={manifestInput}
                    onChange={(e) => setManifestInput(e.target.value)}
                    placeholder="What universe are we building today?" 
                    className="bg-transparent border-none outline-none text-white flex-1 font-light"
                  />
                  <button 
                    onClick={handleManifest}
                    disabled={isManifesting}
                    className="btn-primary px-8 py-4 rounded-full font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isManifesting ? "Manifesting..." : "Manifest"} <Sparkles size={18} className={isManifesting ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-12 text-white/20"
              >
                <ChevronDown size={32} />
              </motion.div>
            </motion.div>
          </Section>

          {/* Marquee Section */}
          <div className="py-12 border-y border-white/5 overflow-hidden bg-white/[0.02]">
            <div className="flex whitespace-nowrap animate-marquee">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-12 items-center px-6">
                  {["SCHEMA BUILDER", "AI GENERATION", "NODE.JS", "EXPRESS", "OPENAPI", "SWAGGER", "CONTEXT API", "VERSION CONTROL", "INTEGRATED TESTING", "DEPLOY ANYWHERE"].map((tag) => (
                    <span key={tag} className="label opacity-30 hover:opacity-100 transition-opacity cursor-default">{tag}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
              width: max-content;
            }
          `}</style>

          {/* Features Section */}
          <Section id="features">
            <div className="w-full">
              <div className="text-center mb-20">
                <span className="label mb-4 block">SYSTEM_CORE</span>
                <h2 className="text-5xl md:text-7xl font-display font-black mb-6">Everything You Need to <br /> <span className="text-accent">Build Modern Backends</span></h2>
                <p className="text-white/40 text-lg max-w-2xl mx-auto">
                  From visual schema design to AI-powered API generation, Make-Back provides all the tools you need.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: Database, tag: "BUILDER", title: "Visual Schema Builder", desc: "Design your database schema with an intuitive drag-and-drop interface. Create ER diagrams that automatically generate optimized structures." },
                  { icon: Brain, tag: "INTELLIGENCE", title: "AI-Powered Generation", desc: "Leverage advanced AI to generate APIs, suggest schema improvements, and create comprehensive documentation from natural language prompts." },
                  { icon: Zap, tag: "PERSISTENCE", title: "Context-Persistent APIs", desc: "Generate Node.js + Express APIs that maintain context across your entire project, eliminating repetitive schema redefinition." },
                  { icon: Shield, tag: "REGENERABLE", title: "Regenerable Architecture", desc: "Modify and regenerate your APIs with version tracking and rollback capabilities for seamless iterative development." },
                  { icon: Code, tag: "DOCUMENTATION", title: "Live Documentation", desc: "Auto-generate OpenAPI/Swagger documentation that updates in real-time as you modify your APIs and schemas." },
                  { icon: Shield, tag: "TESTING", title: "Integrated Testing", desc: "Built-in API testing interface with auto-generated test cases for comprehensive endpoint validation." }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass p-8 rounded-3xl hover:border-accent/40 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="text-accent" size={24} />
                    </div>
                    <span className="label text-[8px] mb-2 block ">{feature.tag}</span>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>

          {/* How It Works Section */}
          <Section id="how-it-works mt-15">
            <div className="w-full mt-[100px]">
              <div className="flex flex-col md:flex-row gap-20 items-start">
                {/* Left: Sticky Header */}
                <div className="md:sticky md:top-32 w-full md:w-1/3">
                  <h2 className="text-5xl md:text-7xl font-display font-black mb-8 leading-[0.9]">
                    How We <br />
                    <span className="text-accent">Manifest</span> <br />
                    Reality.
                  </h2>
                  <p className="text-white/40 text-lg leading-relaxed mb-12">
                    Our neural engine follows a strict four-phase protocol to transform abstract concepts into production-grade infrastructure.
                  </p>
                  <div className="hidden md:block p-6 glass rounded-2xl border-accent/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="label text-[8px]">AGENT READY TO BUILD</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="h-full w-1/3 bg-accent" 
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-white/20">
                        <span>0x442...AF</span>
                        <span>SYNTHESIZING...</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Phase Steps */}
                <div className="w-full md:w-2/3 space-y-8">
                  {[
                    { 
                      phase: "PHASE_01", 
                      title: "Schema Architect", 
                      desc: "Design your database structure visually. Our engine analyzes relationships and suggests optimizations for performance and scalability.",
                      tags: ["VISUAL_ERD", "AUTO_INDEXING", "RELATIONAL_MAPPING"],
                      icon: Database
                    },
                    { 
                      phase: "PHASE_02", 
                      title: "Neural Synthesis", 
                      desc: "The AI manifests complete Node.js + Express modules. Controllers, models, and middleware are generated with strict type safety.",
                      tags: ["AI_GENERATION", "TYPESCRIPT", "EXPRESS_V5"],
                      icon: Brain
                    },
                    { 
                      phase: "PHASE_03", 
                      title: "Validation Protocol", 
                      desc: "Automated testing suites and OpenAPI documentation are generated instantly. Every endpoint is validated against your schema.",
                      tags: ["SWAGGER_UI", "JEST_TESTING", "API_VALIDATION"],
                      icon: Code
                    },
                    { 
                      phase: "PHASE_04", 
                      title: "Quantum Deployment", 
                      desc: "Deploy your backend to any cloud provider with a single click. Integrated CI/CD pipelines ensure your infrastructure is always up to date.",
                      tags: ["DOCKER", "KUBERNETES", "CI_CD_PIPELINE"],
                      icon: Rocket
                    }
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass p-10 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/[0.05] transition-all border-white/5 hover:border-accent/30"
                    >
                      {/* Background Phase Number */}
                      <div className="absolute top-10 right-10 text-9xl font-display font-black text-white/[0.02] group-hover:text-accent/[0.05] transition-colors pointer-events-none">
                        {i + 1}
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <step.icon size={24} />
                          </div>
                          <div>
                            <span className="label text-[8px] ">{step.phase}</span>
                            <h3 className="text-2xl font-bold">{step.title}</h3>
                          </div>
                        </div>

                        <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-xl">
                          {step.desc}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          {step.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-mono text-white/40 tracking-widest">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Final Section */}
          <Section id="launch" className="text-center pb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative max-w-4xl mx-auto overflow-hidden glass rounded-[3rem] px-8 py-24 md:py-32"
              style={{
                background: "radial-gradient(circle at top right, rgba(78, 17, 134, 0.15) 0%, rgba(44, 7, 7, 0.02) 100%)",
                borderColor: "rgba(168, 85, 247, 0.2)",
                boxShadow: "0 0 80px rgba(168, 85, 247, 0.1)"
              }}
            >
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

              {/* Corner Accents */}
              <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-accent/40 rounded-tl-xl delay-100" />
              <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-accent/40 rounded-tr-xl delay-200" />
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-accent/40 rounded-bl-xl delay-300" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-accent/40 rounded-br-xl delay-400" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent" />
                  <span className="label">INITIATE DEPLOYMENT</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent" />
                </div>

                <h2 className="text-5xl md:text-7xl font-display font-black leading-[1.1] mb-6 shadow-sm">
                  Ready to Manifest <br />
                  <span className="font-serif italic font-medium text-accent">Your Legacy?</span>
                </h2>
                
                <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                  Join the elite circle of developers building tomorrow's complex infrastructure in seconds, not months.
                </p>
                
                <div className="flex flex-wrap gap-6 justify-center">
                  <a href="/signup" className="btn-primary group relative px-10 py-5 rounded-full flex items-center gap-3 overflow-hidden shadow-lg shadow-accent/20">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10 text-base font-bold tracking-wide">Start Building Free</span>
                    <Rocket size={18} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                  
                  <a href="/demo" className="glass hover:bg-white/10 transition-colors duration-300 px-10 py-5 rounded-full flex items-center gap-3 border border-white/20 hover:border-accent/50">
                    <span className="text-base font-medium tracking-wide">Watch Demo</span>
                    <Sparkles size={18} className="text-accent" />
                  </a>
                </div>
              </div>
            </motion.div>
          </Section>
          {/* Footer */}
          <footer className="py-20 border-t border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="font-display font-bold text-lg tracking-tighter">MAKE-BACK</span>
              </div>
              
              <div className="flex gap-8">
                <Twitter className="text-white/20 hover:text-accent cursor-pointer transition-colors" />
                <Github className="text-white/20 hover:text-accent cursor-pointer transition-colors" />
                <Discord className="text-white/20 hover:text-accent cursor-pointer transition-colors" />
              </div>

              <p className="text-white/20 text-sm font-display tracking-widest">
                © 2026 NEURAL ARCHITECTS
              </p>
            </div>
          </footer>

        </main>

        {/* Scroll Progress Indicator */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-center">
          <div className="h-32 w-px bg-white/10 relative">
            <motion.div 
              style={{ scaleY: scrollYProgress }} 
              className="absolute top-0 left-0 w-full bg-accent origin-top" 
            />
          </div>
          <span className="label [writing-mode:vertical-rl] text-[8px] opacity-30">SCROLL_PROGRESS</span>
        </div>
      </div>
  )
}
