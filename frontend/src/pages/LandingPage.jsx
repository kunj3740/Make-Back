// import { useState, useEffect, useRef } from "react"
// import { Link } from "react-router-dom"
// import {
//   Database, Code, FileText, TestTube,
//   ArrowRight, CheckCircle, Sparkles, Brain, Workflow,
// } from "lucide-react"
// import { motion, useScroll, useTransform } from "framer-motion"
// import { Canvas, useFrame } from "@react-three/fiber"
// import { MeshDistortMaterial, Sphere, Sparkles as ThreeSparkles, Stars, Float } from "@react-three/drei"
// import * as THREE from 'three'

// /* ─── Inject fonts + global styles ─────────────────────────────────── */
// const Styles = () => (
//   <style>{`
//     @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400&display=swap');

//     *, *::before, *::after { box-sizing: border-box; }

//     /* ── Noise layer ─────────────────── */
//     .noise {
//       position: fixed; inset: 0; pointer-events: none; z-index: 9999;
//       opacity: 0.035; mix-blend-mode: screen;
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
//       background-size: 300px 300px;
//     }

//     /* ── Grid ────────────────────────── */
//     .grid-bg {
//       position: fixed; inset: 0; pointer-events: none; z-index: 0;
//       background-image:
//         linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
//         linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
//       background-size: 72px 72px;
//     }

//     /* ── Scan line ───────────────────── */
//     @keyframes scan {
//       0%   { transform: translateY(-60px); }
//       100% { transform: translateY(110vh); }
//     }
//     .scan {
//       position: fixed; left: 0; right: 0; top: 0; height: 60px;
//       pointer-events: none; z-index: 9998;
//       background: linear-gradient(to bottom, transparent, rgba(107, 33, 168, 0.08), transparent);
//       animation: scan 10s linear infinite;
//     }

//     /* ── Marquee ─────────────────────── */
//     @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
//     .marquee { animation: marquee 30s linear infinite; display: flex; white-space: nowrap; width: max-content; }

//     /* ── Orb float ───────────────────── */
//     @keyframes float-a {
//       0%,100% { transform: scale(1); }
//       50%      { transform: scale(1.02); }
//     }

//     /* ── Blink ───────────────────────── */
//     @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
//     .blink { animation: blink 1.2s step-end infinite; }

//     /* ── Vertical rail ───────────────── */
//     .rail { writing-mode: vertical-rl; transform: rotate(180deg); }

//     /* ── Typography helpers ──────────── */
//     .label {
//       font-family: 'Inter', sans-serif;
//       font-size: 10px;
//       font-weight: 600;
//       letter-spacing: 0.3em;
//       text-transform: uppercase;
//     }

//     /* ── Feature card (Glassmorphic) ─── */
//     .fcard {
//       background: rgba(88, 28, 135, 0.06);
//       border: 1px solid rgba(107, 33, 168, 0.15);
//       backdrop-filter: blur(16px);
//       -webkit-backdrop-filter: blur(16px);
//       border-radius: 24px;
//       transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
//     }
//     .fcard:hover {
//       background: rgba(107, 33, 168, 0.12);
//       border-color: rgba(107, 33, 168, 0.4);
//       transform: translateY(-8px);
//       box-shadow: 0 16px 40px rgba(88, 28, 135, 0.25), inset 0 0 20px rgba(107, 33, 168, 0.08);
//     }

//     /* ── CTA primary ─────────────────── */
//     .btn-primary {
//       background: linear-gradient(135deg, #6b21a8 0%, #581c87 50%, #4c1d95 100%);
//       border: none; cursor: pointer; position: relative; overflow: hidden;
//       transition: transform 0.2s, box-shadow 0.2s;
//     }
//     .btn-primary:hover {
//       transform: translateY(-2px);
//       box-shadow: 0 0 40px rgba(107, 33, 168, 0.45), 0 0 80px rgba(88, 28, 135, 0.2);
//     }
//     .btn-primary::after {
//       content: '';
//       position: absolute; inset: 0;
//       background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.1));
//       pointer-events: none;
//     }

//     /* ── CTA ghost ───────────────────── */
//     .btn-ghost {
//       background: rgba(107, 33, 168, 0.07);
//       border: 1px solid rgba(107, 33, 168, 0.3);
//       cursor: pointer;
//       transition: background 0.2s, border-color 0.2s, transform 0.2s;
//     }
//     .btn-ghost:hover {
//       background: rgba(107, 33, 168, 0.14);
//       border-color: rgba(107, 33, 168, 0.6);
//       transform: translateY(-2px);
//     }

//     /* ── Star Twinkle ────────────────── */
//     @keyframes twinkle {
//       0%, 100% { opacity: 0.8; }
//       50% { opacity: 0.2; }
//     }
//   `}</style>
// )

// /* ─── 3D Universe Portal ────────────────────────────────────────────── */
// const PortalOrb = () => {
//   const meshRef = useRef(null)
  
//   // Temporal Speed implementation
//   useFrame((state) => {
//     const t = state.clock.getElapsedTime()
//     const speed = 1.0 // universe.physics.rotationSpeed loosely mapped
    
//     if (meshRef.current) {
//       meshRef.current.rotation.x = t * 0.1 * speed
//       meshRef.current.rotation.y = t * 0.15 * speed
//       // pulsing
//        const scale = 1 + Math.sin(t * 0.5) * (0.05 * speed)
//        meshRef.current.scale.set(scale, scale, scale)
//     }
//   })

//   return (
//     <group>
//       {/* Layer 1: The Core (Inner Orb) */}
//       <Sphere ref={meshRef} args={[1.2, 128, 128]}>
//         <MeshDistortMaterial 
//           color="#581c87"
//           emissive="#6b21a8"
//           emissiveIntensity={0.3}
//           roughness={0.2}
//           metalness={0.9}
//           distort={0.4}
//           speed={2} 
//         />
//       </Sphere>

//       {/* Layer 2: The Outer Halo (Wireframe) */}
//       <Sphere args={[1.5, 64, 64]}>
//         <meshBasicMaterial color="#581c87" wireframe={true} transparent opacity={0.05} />
//       </Sphere>

//       {/* Layer 3: The Sparkle Field */}
//       <ThreeSparkles count={800} scale={5} size={3} speed={0.5} color="#6b21a8" opacity={0.5} />
//     </group>
//   )
// }

// const UniversePortal = () => {
//   return (
//     <div style={{ position:"absolute", inset:0, zIndex: 0, overflow:"hidden", pointerEvents:"none" }}>
//       <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
//         {/* Environment base lighting */}
//         <ambientLight intensity={0.2} />
        
//         {/* Primary Lighting Highlight */}
//         <pointLight position={[10, 10, 10]} intensity={2} color="#6b21a8" />
        
//         {/* Secondary Rim Light */}
//         <pointLight position={[-10, -10, -10]} intensity={1} color="#581c87" />
        
//         {/* Starfield Density */}
//         <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
//         {/* Center Portal with Float animation */}
//         <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
//           <PortalOrb />
//         </Float>
//       </Canvas>
//     </div>
//   )
// }

// /* ─── Main ─────────────────────────────────────────────────────────── */
// export default function LandingPage() {
//   const [token, setToken] = useState("")
//   const heroRef  = useRef(null)

//   useEffect(() => {
//     const jwt = localStorage.getItem("token")
//     if (jwt) setToken(jwt)
//   }, [])

//   const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
//   const heroY  = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
//   const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0])

//   /* animation variants */
//   const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }
//   const up = {
//     hidden:{ opacity:0, y:30 },
//     show:{ opacity:1, y:0, transition:{ duration:0.65, ease:[0.22,1,0.36,1] } },
//   }

//   const features = [
//     { icon:<Database size={18}/>, tag:"SCHEMA",       title:"Visual Schema Builder",    desc:"Design your database schema with an intuitive drag-and-drop interface. Create ER diagrams that automatically generate optimized database structures." },
//     { icon:<Brain size={18}/>,   tag:"INTELLIGENCE", title:"AI-Powered Generation",    desc:"Leverage advanced AI to generate APIs, suggest schema improvements, and create comprehensive documentation from natural language prompts." },
//     { icon:<Code size={18}/>,    tag:"CONTEXT",      title:"Context-Persistent APIs",  desc:"Generate Node.js + Express APIs that maintain context across your entire project, eliminating repetitive schema redefinition." },
//     { icon:<Workflow size={18}/>,tag:"ARCHITECTURE", title:"Regenerable Architecture", desc:"Modify and regenerate your APIs with version tracking and rollback capabilities for seamless iterative development." },
//     { icon:<FileText size={18}/>,tag:"DOCS",         title:"Live Documentation",       desc:"Auto-generate OpenAPI/Swagger documentation that updates in real-time as you modify your APIs and schemas." },
//     { icon:<TestTube size={18}/>,tag:"QA",           title:"Integrated Testing",       desc:"Built-in API testing interface with auto-generated test cases for comprehensive endpoint validation." },
//   ]

//   const steps = [
//     { n:"01", title:"Design Your Schema",  desc:"Use our visual builder to create your database schema or let AI suggest one based on your project description." },
//     { n:"02", title:"Generate APIs",       desc:"Create API modules with natural language prompts. Our AI generates complete controllers, models, and middleware." },
//     { n:"03", title:"Test & Document",    desc:"Automatically generated documentation and testing interface let you validate your APIs instantly." },
//     { n:"04", title:"Deploy & Scale",      desc:"Export your complete backend or deploy directly to your preferred cloud platform." },
//   ]

//   const tags = ["SCHEMA BUILDER","AI GENERATION","NODE.JS","EXPRESS","OPENAPI","SWAGGER","CONTEXT API","VERSION CONTROL","INTEGRATED TESTING","DEPLOY ANYWHERE","SCHEMA BUILDER","AI GENERATION","NODE.JS","EXPRESS","OPENAPI","SWAGGER","CONTEXT API","VERSION CONTROL","INTEGRATED TESTING","DEPLOY ANYWHERE"]

//   /* shared layout container */
//   const W = { maxWidth:1100, margin:"0 auto", padding:"0 48px", width:"100%" }

//   /* accent color - Purple Theme */
//   const A = "#6b21a8"   // inner orb emissive
//   const A2 = "#581c87"  // inner orb color
//   const A3 = "#4a044e"  // darker matching shade

//   return (
//     <div style={{ minHeight:"100vh", backgroundColor:"#090514", color:"#fff", fontFamily:"'Inter',sans-serif", overflowX:"hidden", position:"relative" }}>
//       <Styles/>
//       <div className="noise"/>
//       <div className="scan"/>
//       <div className="grid-bg"/>
//       {/* ══════════════════════════════════════════════════════
//           HERO
//       ══════════════════════════════════════════════════════ */}
//       <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
//         <UniversePortal/>

//         {/* LEFT rail */}
//         <div className="rail label" style={{
//           position:"absolute", left:16, top:"50%", color:"rgba(255,255,255,0.18)",
//           userSelect:"none", zIndex: 10
//         }}>
//           MAKE-BACK · AI BACKEND · v1.0
//         </div>
//         {/* RIGHT rail */}
//         <div className="label" style={{
//           position:"absolute", right:16, top:"50%",
//           writingMode:"vertical-rl", color:"rgba(255,255,255,0.18)",
//           userSelect:"none", zIndex: 10
//         }}>
//           BUILD VISUALLY — BUILD INTELLIGENTLY
//         </div>

//         <motion.div style={{ y:heroY, opacity:heroOp, ...W, position:"relative", zIndex:2, paddingTop:120, paddingBottom:120, textAlign: "center" }}
//           initial="hidden" animate="show" variants={stagger}
//         >
//           {/* Status pill */}
//           <motion.div variants={up} style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:36 }}>
//             <span className="blink" style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", flexShrink:0 }}/>
//             <span className="label" style={{ color:"rgba(255,255,255,0.4)" }}>
//               SYSTEM ONLINE &nbsp;·&nbsp; AI BACKEND DEVELOPMENT &nbsp;·&nbsp; STATUS: ACTIVE
//             </span>
//           </motion.div>

//           {/* HEADLINE */}
//           <div style={{ marginBottom:32 }}>
//             <motion.div variants={up} style={{
//               display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px 24px"
//             }}>
//               <span style={{
//                 fontFamily:"'Inter',sans-serif",
//                 fontSize:"clamp(50px, 9vw, 120px)",
//                 fontWeight:900,
//                 lineHeight:0.9,
//                 letterSpacing:"-0.04em",
//                 color:"#fff",
//               }}>
//                 Build
//               </span>
//               <span style={{
//                 fontFamily:"'Playfair Display',serif",
//                 fontStyle:"italic",
//                 fontWeight:300,
//                 fontSize:"clamp(52px, 9.5vw, 125px)",
//                 lineHeight:0.9,
//                 letterSpacing:"-0.02em",
//                 color: "#fff",
//                 position: "relative"
//               }}>
//                 Backends
//               </span>
//               <span style={{
//                 fontFamily:"'Inter',sans-serif",
//                 fontSize:"clamp(50px, 9vw, 120px)",
//                 fontWeight:900,
//                 lineHeight:0.9,
//                 letterSpacing:"-0.04em",
//                 color:"#fff",
//               }}>
//                 Visually.
//               </span>
//             </motion.div>
//           </div>

//           {/* Sub-text */}
//           <motion.p variants={up} style={{
//             fontFamily:"'Inter',sans-serif",
//             fontWeight:400,
//             fontSize:17,
//             lineHeight:1.7,
//             color:"rgba(255,255,255,0.7)",
//             maxWidth:600,
//             margin:"0 auto 48px",
//           }}>
//             Manifest entire backends from a single thought. Experience the synthesis of AI vision, precise schema design, and seamless Node.js output.
//           </motion.p>

//           {/* Manifest Input Form (CTA row) */}
//           <motion.div variants={up} style={{ display:"flex", justifyContent:"center", marginBottom:48 }}>
//             <div style={{
//               display: "flex",
//               alignItems: "center",
//               background: "rgba(88, 28, 135, 0.25)",
//               border: "1px solid rgba(107, 33, 168, 0.2)",
//               borderRadius: "50px",
//               padding: "6px 6px 6px 24px",
//               width: "100%",
//               maxWidth: "600px",
//               backdropFilter: "blur(12px)",
//               WebkitBackdropFilter: "blur(12px)",
//               boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
//             }}>
//               <input 
//                 type="text" 
//                 placeholder="Describe a universe to manifest..." 
//                 style={{
//                   background: "transparent",
//                   border: "none",
//                   outline: "none",
//                   color: "#fff",
//                   fontFamily: "'Inter', sans-serif",
//                   fontSize: 16,
//                   fontWeight: 300,
//                   width: "100%",
//                   marginRight: 16,
//                 }}
//               />
//               <Link to={token ? "/projects" : "/signup"} style={{ textDecoration:"none", flexShrink: 0 }}>
//                 <button style={{
//                   display:"flex", alignItems:"center", gap:8,
//                   background: "rgba(255, 255, 255, 0.85)",
//                   border: "1px solid rgba(255, 255, 255, 0.2)",
//                   padding:"12px 24px", borderRadius:"40px",
//                   color:"#050505", fontSize:14, fontWeight:600, letterSpacing:"0.02em",
//                   cursor: "pointer",
//                   transition: "all 0.2s ease"
//                 }}
//                 onMouseOver={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "scale(1.02)" }}
//                 onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)"; e.currentTarget.style.transform = "scale(1)" }}
//                 >
//                   <Sparkles size={16} fill="#050505" strokeWidth={1} />
//                   Manifest
//                 </button>
//               </Link>
//             </div>
//           </motion.div>

//           {/* Optional bottom badges */}
//           <motion.div variants={up} style={{ display:"flex", flexWrap:"wrap", gap:24, justifyContent:"center" }}>
//             {["Node.js + Express", "PostgreSQL Ready", "OpenAPI Gen"].map((t) => (
//               <div key={t} style={{
//                 padding: "8px 16px",
//                 borderRadius: "30px",
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 fontSize: 12,
//                 color: "rgba(255,255,255,0.5)"
//               }}>
//                 {t}
//               </div>
//             ))}
//           </motion.div>
//         </motion.div>

//         {/* Scroll hint */}
//         <motion.div
//           initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
//           style={{ position:"absolute", bottom:36, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8, zIndex:2 }}
//         >
//           <span className="label" style={{ color:"rgba(255,255,255,0.2)" }}>SCROLL</span>
//           <div style={{ width:1, height:36, background:`linear-gradient(to bottom, ${A}, transparent)` }}/>
//         </motion.div>
//       </section>

//       {/* ══════════════════════════════════════════════════════
//           MARQUEE
//       ══════════════════════════════════════════════════════ */}
//       <div style={{
//         borderTop:"1px solid rgba(255,255,255,0.05)",
//         borderBottom:"1px solid rgba(255,255,255,0.05)",
//         padding:"13px 0", overflow:"hidden", position:"relative", zIndex:10,
//         background:"rgba(107, 33, 168, 0.05)",
//       }}>
//         <div className="marquee" style={{ gap:40 }}>
//           {tags.map((t,i) => (
//             <span key={i} className="label" style={{ color:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", gap:16, paddingRight:40 }}>
//               <span style={{ width:4,height:4,borderRadius:"50%",background:A,display:"inline-block",flexShrink:0 }}/>
//               {t}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* ══════════════════════════════════════════════════════
//           FEATURES
//       ══════════════════════════════════════════════════════ */}
//       <section id="features" style={{ position:"relative", zIndex:10, padding:"120px 0" }}>
//         <div style={W}>

//           {/* Section header */}
//           <motion.div
//             initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
//             viewport={{ once:true, margin:"-60px" }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
//             style={{ marginBottom:64, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" }}
//           >
//             <div style={{ display:"inline-flex", alignItems:"center", gap:14, marginBottom:20 }}>
//               <div style={{ width:24, height:1, background:A }}/>
//               <span className="label" style={{ color:A }}>CAPABILITIES</span>
//               <div style={{ width:24, height:1, background:A }}/>
//             </div>
//             <h2 style={{
//               fontFamily:"'Inter',sans-serif", fontWeight:900,
//               fontSize:"clamp(34px,5vw,60px)", letterSpacing:"-0.03em", lineHeight:1.05,
//               color:"#fff", margin:0,
//             }}>
//               Everything You Need to Build{" "}
//               <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:300, color:"#6b21a8" }}>
//                 Modern Backends
//               </span>
//             </h2>
//           </motion.div>

//           {/* 3-column isolated grid */}
//           <motion.div
//             initial="hidden" whileInView="show"
//             viewport={{ once:true, margin:"-40px" }} variants={stagger}
//             style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:32 }}
//           >
//             {features.map((f,i) => (
//               <motion.div key={i} variants={up} className="fcard" style={{ padding:"40px 36px" }}>
//                 {/* top row */}
//                 <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
//                   <div style={{
//                     width:44, height:44, borderRadius:8,
//                     background:"rgba(107, 33, 168, 0.15)", border:"1px solid rgba(107, 33, 168, 0.3)",
//                     display:"flex", alignItems:"center", justifyContent:"center", color:A,
//                   }}>
//                     {f.icon}
//                   </div>
//                   <span className="label" style={{ color:"rgba(255,255,255,0.2)" }}>{f.tag}</span>
//                 </div>

//                 <div style={{ height:1, background:"rgba(255,255,255,0.05)", marginBottom:24 }}/>

//                 <h3 style={{
//                   fontFamily:"'Inter',sans-serif", fontWeight:600,
//                   fontSize:18, letterSpacing:"-0.01em", color:"#fff", marginBottom:12,
//                 }}>
//                   {f.title}
//                 </h3>
//                 <p style={{
//                   fontFamily:"'Inter',sans-serif", fontWeight:300,
//                   fontSize:15, lineHeight:1.7, color:"rgba(255,255,255,0.45)",
//                 }}>
//                   {f.desc}
//                 </p>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════
//           HOW IT WORKS
//       ══════════════════════════════════════════════════════ */}
//       <section id="how-it-works" style={{ position:"relative", zIndex:10, padding:"120px 0", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
//         <div style={W}>

//           {/* responsive two-column: header | steps */}
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(400px, 1fr))", gap:80, alignItems:"start" }}>

//             {/* left: header (sticky) */}
//             <motion.div
//               initial={{ opacity:0, x:-24 }} whileInView={{ opacity:1, x:0 }}
//               viewport={{ once:true, margin:"-60px" }} transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
//               style={{ position:"sticky", top:120 }}
//             >
//               <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
//                 <div style={{ width:40, height:1, background:A2 }}/>
//                 <span className="label" style={{ color:A2 }}>WORKFLOW</span>
//               </div>
//               <h2 style={{
//                 fontFamily:"'Inter',sans-serif", fontWeight:900,
//                 fontSize:"clamp(34px,5vw,56px)", letterSpacing:"-0.03em", lineHeight:1.05,
//                 color:"#fff", margin:"0 0 24px",
//               }}>
//                 How<br/>
//                 <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:300, color:"#6b21a8" }}>
//                   Make-Back
//                 </span>
//                 <br/>Works
//               </h2>
//               <p style={{
//                 fontFamily:"'Inter',sans-serif", fontWeight:300,
//                 fontSize:17, lineHeight:1.7, color:"rgba(255,255,255,0.5)", maxWidth:400,
//               }}>
//                 Four precise steps to transform your ideas into production-ready backends. Seamless integration from vision to deployment.
//               </p>
//             </motion.div>

//             {/* right: step list */}
//             <div style={{ display:"flex", flexDirection:"column" }}>
//               {steps.map((s,i) => (
//                 <motion.div key={i}
//                   initial={{ opacity:0, x:24 }} whileInView={{ opacity:1, x:0 }}
//                   viewport={{ once:true, margin:"-30px" }}
//                   transition={{ duration:0.55, delay:i*0.08, ease:[0.22,1,0.36,1] }}
//                   style={{
//                     display:"flex", gap:32, alignItems:"flex-start",
//                     padding:"36px 40px",
//                     background: "rgba(88, 28, 135, 0.05)",
//                     border: "1px solid rgba(107, 33, 168, 0.15)",
//                     backdropFilter:"blur(16px)",
//                     WebkitBackdropFilter:"blur(16px)",
//                     borderRadius: 24,
//                     marginBottom: 24,
//                     transition:"all 0.3s ease",
//                   }}
//                   onMouseOver={(e) => { e.currentTarget.style.background = "rgba(107, 33, 168, 0.1)" }}
//                   onMouseOut={(e) => { e.currentTarget.style.background = "rgba(88, 28, 135, 0.05)" }}
//                 >
//                   {/* Step number box */}
//                   <div style={{
//                     flexShrink:0, width:56, height:56, borderRadius:8,
//                     border:`1px solid rgba(107, 33, 168, 0.35)`,
//                     background:"rgba(107, 33, 168, 0.15)",
//                     display:"flex", alignItems:"center", justifyContent:"center",
//                     fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:700,
//                     letterSpacing:"0.08em", color:A,
//                   }}>
//                     {s.n}
//                   </div>

//                   <div style={{ paddingTop:4 }}>
//                     <h3 style={{
//                       fontFamily:"'Inter',sans-serif", fontWeight:600,
//                       fontSize:20, letterSpacing:"-0.02em", color:"#fff", marginBottom:12,
//                     }}>
//                       {s.title}
//                     </h3>
//                     <p style={{
//                       fontFamily:"'Inter',sans-serif", fontWeight:300,
//                       fontSize:15.5, lineHeight:1.75, color:"rgba(255,255,255,0.45)",
//                     }}>
//                       {s.desc}
//                     </p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════
//           CTA
//       ══════════════════════════════════════════════════════ */}
//       <section style={{ position:"relative", zIndex:10, padding:"120px 0" }}>
//         <div style={W}>
//           <motion.div
//             initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }}
//             viewport={{ once:true, margin:"-60px" }}
//             transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
//             style={{
//               position:"relative", overflow:"hidden",
//               background:"rgba(88, 28, 135, 0.08)",
//               border:"1px solid rgba(107, 33, 168, 0.2)",
//               backdropFilter: "blur(24px)",
//               WebkitBackdropFilter: "blur(24px)",
//               borderRadius:32, padding:"100px 40px",
//               boxShadow: "0 32px 80px rgba(88, 28, 135, 0.25)",
//             }}
//           >
//             {/* Background glow */}
//             <div style={{
//               position:"absolute", top:"50%", left:"50%",
//               transform:"translate(-50%,-50%)",
//               width:700, height:400, borderRadius:"50%",
//               background:`radial-gradient(ellipse, rgba(107, 33, 168, 0.15) 0%, rgba(88, 28, 135, 0.05) 50%, transparent 70%)`,
//               pointerEvents:"none",
//             }}/>

//             {/* Corner Bracket Details */}
//             {[
//               { top:24, left:24, borderTop:`1px solid ${A}`, borderLeft:`1px solid ${A}` },
//               { top:24, right:24, borderTop:`1px solid ${A}`, borderRight:`1px solid ${A}` },
//               { bottom:24, left:24, borderBottom:`1px solid ${A}`, borderLeft:`1px solid ${A}` },
//               { bottom:24, right:24, borderBottom:`1px solid ${A}`, borderRight:`1px solid ${A}` },
//             ].map((s,i) => <div key={i} style={{ position:"absolute", width:36, height:36, opacity: 0.5, ...s }}/>)}

//             <div style={{ position:"relative", textAlign:"center", maxWidth: 600, margin: "0 auto" }}>
//               <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:32 }}>
//                 <div style={{ height:1, width:40, background:`rgba(107, 33, 168, 0.5)` }}/>
//                 <span className="label" style={{ color:A }}>READY TO BUILD</span>
//                 <div style={{ height:1, width:40, background:`rgba(107, 33, 168, 0.5)` }}/>
//               </div>

//               <h2 style={{
//                 fontFamily:"'Inter',sans-serif", fontWeight:900,
//                 fontSize:"clamp(34px,5vw,56px)", letterSpacing:"-0.03em", lineHeight:1.08,
//                 color:"#fff", marginBottom:24,
//               }}>
//                 Ready to Transform Your{" "}
//                 <span style={{
//                   fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:300,
//                   color: "#6b21a8",
//                 }}>
//                   Backend Development?
//                 </span>
//               </h2>

//               <p style={{
//                 fontFamily:"'Inter',sans-serif", fontWeight:400,
//                 fontSize:17, lineHeight:1.7, color:"rgba(255,255,255,0.6)",
//                 marginBottom:48,
//               }}>
//                 Join thousands of developers who are building faster, smarter backends with Make-Back.
//               </p>

//               <div style={{ display:"flex", flexWrap:"wrap", gap:16, justifyContent:"center" }}>
//                 <Link to="/signup" style={{ textDecoration:"none" }}>
//                   <button className="btn-primary" style={{
//                     display:"flex", alignItems:"center", gap:10,
//                     padding:"16px 40px", borderRadius:8,
//                     color:"#fff", fontSize:14, fontWeight:600, letterSpacing:"0.05em",
//                   }}>
//                     Get Started for Free <ArrowRight size={16}/>
//                   </button>
//                 </Link>
//                 <Link to="/contact" style={{ textDecoration:"none" }}>
//                   <button className="btn-ghost" style={{
//                     padding:"16px 40px", borderRadius:8,
//                     color:"rgba(255,255,255,0.7)", fontSize:14, fontWeight:500, letterSpacing:"0.05em",
//                   }}>
//                     Talk to Sales
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════
//           FOOTER
//       ══════════════════════════════════════════════════════ */}
//       <footer style={{
//         borderTop:"1px solid rgba(255,255,255,0.05)",
//         position:"relative", zIndex:10,
//       }}>
//         <div style={{ ...W, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"32px 48px", flexWrap:"wrap", gap:16 }}>
//           <span className="label" style={{ color:"rgba(255,255,255,0.25)" }}>© 2026 MAKE-BACK — EXPERIMENTAL BUILD</span>
//           <span style={{ display:"flex", alignItems:"center", gap:10 }}>
//             <span className="blink" style={{ width:8, height:8, borderRadius:"50%", background:A }}/>
//             <span className="label" style={{ color:"rgba(255,255,255,0.25)" }}>AI SYSTEM CONNECTED</span>
//           </span>
//         </div>
//       </footer>
//     </div>
//   )
// }

// import { useState, useEffect, useRef } from "react"
// import { Link } from "react-router-dom"
// import {
//   Database, Code, FileText, TestTube,
//   ArrowRight, CheckCircle, Sparkles, Brain, Workflow,
//   Layers, Zap, Shield, Cpu, Globe, Rocket
// } from "lucide-react"
// import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
// import { Canvas, useFrame } from "@react-three/fiber"
// import { MeshDistortMaterial, Sphere, Sparkles as ThreeSparkles, Stars, Float } from "@react-three/drei"
// import * as THREE from 'three'

// /* ─── Inject fonts + global styles ─────────────────────────────────── */
// const Styles = () => (
//   <style>{`
//     @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400&display=swap');

//     *, *::before, *::after { box-sizing: border-box; }

//     /* ── Noise layer ─────────────────── */
//     .noise {
//       position: fixed; inset: 0; pointer-events: none; z-index: 9999;
//       opacity: 0.035; mix-blend-mode: screen;
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
//       background-size: 300px 300px;
//     }

//     /* ── Grid ────────────────────────── */
//     .grid-bg {
//       position: fixed; inset: 0; pointer-events: none; z-index: 0;
//       background-image:
//         linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
//         linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
//       background-size: 72px 72px;
//     }

//     /* ── Scan line ───────────────────── */
//     @keyframes scan {
//       0%   { transform: translateY(-60px); }
//       100% { transform: translateY(110vh); }
//     }
//     .scan {
//       position: fixed; left: 0; right: 0; top: 0; height: 60px;
//       pointer-events: none; z-index: 9998;
//       background: linear-gradient(to bottom, transparent, rgba(107, 33, 168, 0.08), transparent);
//       animation: scan 10s linear infinite;
//     }

//     /* ── Marquee ─────────────────────── */
//     @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
//     .marquee { animation: marquee 30s linear infinite; display: flex; white-space: nowrap; width: max-content; }

//     /* ── Orb float ───────────────────── */
//     @keyframes float-a {
//       0%,100% { transform: scale(1); }
//       50%      { transform: scale(1.02); }
//     }

//     /* ── Blink ───────────────────────── */
//     @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
//     .blink { animation: blink 1.2s step-end infinite; }

//     /* ── Vertical rail ───────────────── */
//     .rail { writing-mode: vertical-rl; transform: rotate(180deg); }

//     /* ── Typography helpers ──────────── */
//     .label {
//       font-family: 'Inter', sans-serif;
//       font-size: 10px;
//       font-weight: 600;
//       letter-spacing: 0.3em;
//       text-transform: uppercase;
//     }

//     /* ── Feature card (High-Contrast Blueprint) ─── */
//     .fcard {
//       background: #0d081a;
//       border: 1px solid rgba(168, 85, 247, 0.3);
//       border-radius: 8px;
//       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//       position: relative;
//       display: flex;
//       flex-direction: column;
//       overflow: hidden;
//     }
//     .fcard:hover {
//       border-color: #a855f7;
//       background: #120b24;
//       transform: translateY(-4px);
//       box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.1);
//     }
//     .fcard-header {
//       padding: 20px;
//       background: rgba(168, 85, 247, 0.1);
//       border-bottom: 1px solid rgba(168, 85, 247, 0.2);
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//     }
//     .fcard:hover .fcard-header {
//       background: rgba(168, 85, 247, 0.2);
//     }
//     .fcard-body {
//       padding: 24px;
//       flex-grow: 1;
//     }
//     .fcard-footer {
//       padding: 16px 20px;
//       border-top: 1px solid rgba(255, 255, 255, 0.05);
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       background: rgba(0, 0, 0, 0.2);
//     }

//     /* ── Schematic Grid ─── */
//     .schematic-bg {
//       position: absolute; inset: 0;
//       background-image: 
//         linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
//         linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px);
//       background-size: 60px 60px;
//       mask-image: radial-gradient(circle at center, black, transparent 90%);
//       pointer-events: none;
//       opacity: 0.4;
//     }

//     /* ── CTA primary ─────────────────── */
//     .btn-primary {
//       background: linear-gradient(135deg, #6b21a8 0%, #581c87 50%, #4c1d95 100%);
//       border: none; cursor: pointer; position: relative; overflow: hidden;
//       transition: transform 0.2s, box-shadow 0.2s;
//     }
//     .btn-primary:hover {
//       transform: translateY(-2px);
//       box-shadow: 0 0 40px rgba(107, 33, 168, 0.45), 0 0 80px rgba(88, 28, 135, 0.2);
//     }

//     /* ── CTA ghost ───────────────────── */
//     .btn-ghost {
//       background: rgba(107, 33, 168, 0.07);
//       border: 1px solid rgba(107, 33, 168, 0.3);
//       cursor: pointer;
//       transition: background 0.2s, border-color 0.2s, transform 0.2s;
//     }
//     .btn-ghost:hover {
//       background: rgba(107, 33, 168, 0.14);
//       border-color: rgba(107, 33, 168, 0.6);
//       transform: translateY(-2px);
//     }

//     /* ── Bento Grid ──────────────────── */
//     .bento-grid {
//       display: grid;
//       grid-template-columns: repeat(12, 1fr);
//       gap: 24px;
//     }
//     @media (max-width: 1024px) {
//       .bento-grid { grid-template-columns: repeat(6, 1fr); }
//     }
//     @media (max-width: 640px) {
//       .bento-grid { display: flex; flex-direction: column; }
//     }

//     /* ── Timeline ────────────────────── */
//     .timeline-line {
//       position: absolute; left: 28px; top: 0; bottom: 0;
//       width: 2px; background: rgba(107, 33, 168, 0.1);
//     }
//     .timeline-progress {
//       position: absolute; left: 28px; top: 0; width: 2px;
//       background: linear-gradient(to bottom, transparent, #6b21a8, #6b21a8);
//       transform-origin: top;
//     }
//   `}</style>
// )

// /* ─── 3D Universe Portal ────────────────────────────────────────────── */
// const PortalOrb = () => {
//   const meshRef = useRef(null)
  
//   useFrame((state) => {
//     const t = state.clock.getElapsedTime()
//     const speed = 1.0 
    
//     if (meshRef.current) {
//       meshRef.current.rotation.x = t * 0.1 * speed
//       meshRef.current.rotation.y = t * 0.15 * speed
//        const scale = 1 + Math.sin(t * 0.5) * (0.05 * speed)
//        meshRef.current.scale.set(scale, scale, scale)
//     }
//   })

//   return (
//     <group>
//       <Sphere ref={meshRef} args={[1.2, 128, 128]}>
//         <MeshDistortMaterial 
//           color="#581c87"
//           emissive="#6b21a8"
//           emissiveIntensity={0.3}
//           roughness={0.2}
//           metalness={0.9}
//           distort={0.4}
//           speed={2} 
//         />
//       </Sphere>
//       <Sphere args={[1.5, 64, 64]}>
//         <meshBasicMaterial color="#581c87" wireframe={true} transparent opacity={0.05} />
//       </Sphere>
//       <ThreeSparkles count={800} scale={5} size={3} speed={0.5} color="#6b21a8" opacity={0.5} />
//     </group>
//   )
// }

// const UniversePortal = () => {
//   return (
//     <div style={{ position:"absolute", inset:0, zIndex: 0, overflow:"hidden", pointerEvents:"none" }}>
//       <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
//         <ambientLight intensity={0.2} />
//         <pointLight position={[10, 10, 10]} intensity={2} color="#6b21a8" />
//         <pointLight position={[-10, -10, -10]} intensity={1} color="#581c87" />
//         <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
//         <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
//           <PortalOrb />
//         </Float>
//       </Canvas>
//     </div>
//   )
// }

// /* ─── Components ───────────────────────────────────────────────────── */

// const FeatureCard = ({ icon: Icon, title, desc, tag, span = "col-span-4", delay = 0 }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.6, delay, ease: "easeOut" }}
//       className={`fcard ${span}`}
//     >
//       <div className="fcard-header">
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <div style={{ 
//             width: 36, height: 36, borderRadius: '8px',
//             background: '#a855f7', color: '#fff',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
//           }}>
//             <Icon size={20} />
//           </div>
//           <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
//         </div>
//         <div style={{ 
//           padding: '4px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)',
//           color: '#a855f7', fontSize: '10px', fontWeight: 700, fontFamily: 'monospace'
//         }}>
//           {tag}
//         </div>
//       </div>

//       <div className="fcard-body">
//         <p style={{ 
//           fontSize: '15px', lineHeight: 1.6, 
//           color: 'rgba(255,255,255,0.6)', fontWeight: 300,
//           margin: 0
//         }}>
//           {desc}
//         </p>
//       </div>

//       <div className="fcard-footer">
//         <div style={{ display: 'flex', gap: '4px' }}>
//           {[1,2,3,4,5].map(i => <div key={i} style={{ width: 12, height: 2, background: i <= 3 ? '#a855f7' : 'rgba(255,255,255,0.1)' }} />)}
//         </div>
//         <div style={{ color: '#a855f7', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
//           VIEW_DOCS <ArrowRight size={12} />
//         </div>
//       </div>
//     </motion.div>
//   )
// }

// const StepItem = ({ number, title, desc, index }) => {
//   const ref = useRef(null)
//   const isInView = useInView(ref, { once: true, margin: "-100px" })

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, x: 50 }}
//       animate={isInView ? { opacity: 1, x: 0 } : {}}
//       transition={{ duration: 0.6, delay: index * 0.1 }}
//       style={{ 
//         position: 'relative', 
//         paddingLeft: '80px', 
//         paddingBottom: '64px',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '16px'
//       }}
//     >
//       {/* Step Indicator */}
//       <div style={{ 
//         position: 'absolute', left: '12px', top: '0',
//         width: '32px', height: '32px', borderRadius: '50%',
//         background: isInView ? '#6b21a8' : '#1a1a1a',
//         border: `2px solid ${isInView ? '#a855f7' : 'rgba(107, 33, 168, 0.2)'}`,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         zIndex: 2, transition: 'all 0.5s ease',
//         boxShadow: isInView ? '0 0 20px rgba(107, 33, 168, 0.5)' : 'none'
//       }}>
//         <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{number}</span>
//       </div>

//       <div style={{ 
//         padding: '32px', 
//         background: 'rgba(255,255,255,0.02)', 
//         border: '1px solid rgba(255,255,255,0.05)',
//         borderRadius: '24px',
//         backdropFilter: 'blur(8px)'
//       }}>
//         <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>{title}</h3>
//         <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>{desc}</p>
//       </div>
//     </motion.div>
//   )
// }

// /* ─── Main ─────────────────────────────────────────────────────────── */
// export default function LandingPage() {
//   const [token, setToken] = useState("")
//   const heroRef  = useRef(null)
//   const featuresRef = useRef(null)
//   const howItWorksRef = useRef(null)

//   useEffect(() => {
//     const jwt = localStorage.getItem("token")
//     if (jwt) setToken(jwt)
//   }, [])

//   const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
//   const heroY  = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
//   const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0])

//   const { scrollYProgress: howItWorksProgress } = useScroll({
//     target: howItWorksRef,
//     offset: ["start end", "end start"]
//   })
//   const timelineScale = useSpring(howItWorksProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

//   const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }
//   const up = {
//     hidden:{ opacity:0, y:30 },
//     show:{ opacity:1, y:0, transition:{ duration:0.65, ease: "easeOut" } },
//   }

//   const features = [
//     { icon: Database, tag: "CORE", title: "Visual Schema Architect", desc: "Design complex relational structures with a fluid, visual interface that understands your data intent.", span: "lg:col-span-8 md:col-span-6" },
//     { icon: Brain, tag: "AI", title: "Neural Generation", desc: "Our LLM-driven engine transforms natural language into robust, secure API endpoints in seconds.", span: "lg:col-span-4 md:col-span-6" },
//     { icon: Zap, tag: "PERFORMANCE", title: "Instant Deployment", desc: "Zero-config deployment to global edge networks with automatic scaling and load balancing.", span: "lg:col-span-4 md:col-span-6" },
//     { icon: Shield, tag: "SECURITY", title: "Enterprise Guard", desc: "Built-in JWT auth, rate limiting, and SQL injection protection out of the box.", span: "lg:col-span-4 md:col-span-6" },
//     { icon: Globe, tag: "CONNECTIVITY", title: "Universal SDKs", desc: "Auto-generate type-safe client SDKs for React, Vue, Swift, and Kotlin.", span: "lg:col-span-4 md:col-span-6" },
//     { icon: Code, tag: "DEVELOPER", title: "Context-Aware APIs", desc: "APIs that evolve with your schema, maintaining strict type safety and documentation sync.", span: "lg:col-span-12 md:col-span-12" },
//   ]

//   const steps = [
//     { n: "01", title: "Conceptualize", desc: "Describe your application's purpose. Our AI analyzes your requirements to suggest an optimal data architecture." },
//     { n: "02", title: "Architect", desc: "Refine your schema visually. Add relationships, constraints, and custom logic with a few clicks." },
//     { n: "03", title: "Synthesize", desc: "Watch as the system generates complete Node.js controllers, models, and comprehensive documentation." },
//     { n: "04", title: "Launch", desc: "Deploy your production-ready backend to our managed cloud or export the source code to your own infrastructure." },
//   ]

//   const tags = ["SCHEMA BUILDER","AI GENERATION","NODE.JS","EXPRESS","OPENAPI","SWAGGER","CONTEXT API","VERSION CONTROL","INTEGRATED TESTING","DEPLOY ANYWHERE","SCHEMA BUILDER","AI GENERATION","NODE.JS","EXPRESS","OPENAPI","SWAGGER","CONTEXT API","VERSION CONTROL","INTEGRATED TESTING","DEPLOY ANYWHERE"]

//   const W = { maxWidth:1200, margin:"0 auto", padding:"0 48px", width:"100%" }
//   const A = "#6b21a8"

//   return (
//     <div style={{ minHeight:"100vh", backgroundColor:"#05020a", color:"#fff", fontFamily:"'Inter',sans-serif", overflowX:"hidden", position:"relative" }}>
//       <Styles/>
//       <div className="noise"/>
//       <div className="scan"/>
//       <div className="grid-bg"/>

//       {/* ══════════════════════════════════════════════════════
//           HERO
//       ══════════════════════════════════════════════════════ */}
//       <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
//         <UniversePortal/>

//         <div className="rail label" style={{
//           position:"absolute", left:16, top:"50%", color:"rgba(255,255,255,0.1)",
//           userSelect:"none", zIndex: 10
//         }}>
//           MAKE-BACK · AI BACKEND ENGINE · v2.0
//         </div>
//         <div className="label" style={{
//           position:"absolute", right:16, top:"50%",
//           writingMode:"vertical-rl", color:"rgba(255,255,255,0.1)",
//           userSelect:"none", zIndex: 10
//         }}>
//           BEYOND CODE — INTO MANIFESTATION
//         </div>

//         <motion.div style={{ y:heroY, opacity:heroOp, ...W, position:"relative", zIndex:2, textAlign: "center" }}
//           initial="hidden" animate="show" variants={stagger}
//         >
//           <motion.div variants={up} style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:36 }}>
//             <span className="blink" style={{ width:6, height:6, borderRadius:"50%", background:"#a855f7", boxShadow: '0 0 10px #a855f7' }}/>
//             <span className="label" style={{ color:"rgba(255,255,255,0.4)", letterSpacing: '0.5em' }}>
//               QUANTUM ENGINE ACTIVE
//             </span>
//           </motion.div>

//           <div style={{ marginBottom:32 }}>
//             <motion.div variants={up} style={{
//               display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px 24px"
//             }}>
//               <span style={{
//                 fontSize:"clamp(50px, 9vw, 110px)",
//                 fontWeight:900,
//                 lineHeight:0.9,
//                 letterSpacing:"-0.05em",
//                 color:"#fff",
//               }}>
//                 Build
//               </span>
//               <span style={{
//                 fontFamily:"'Playfair Display',serif",
//                 fontStyle:"italic",
//                 fontWeight:300,
//                 fontSize:"clamp(52px, 9.5vw, 115px)",
//                 lineHeight:0.9,
//                 letterSpacing:"-0.02em",
//                 color: "#a855f7",
//               }}>
//                 Backends
//               </span>
//               <span style={{
//                 fontSize:"clamp(50px, 9vw, 110px)",
//                 fontWeight:900,
//                 lineHeight:0.9,
//                 letterSpacing:"-0.05em",
//                 color:"#fff",
//               }}>
//                 Intelligently.
//               </span>
//             </motion.div>
//           </div>

//           <motion.p variants={up} style={{
//             fontWeight:300,
//             fontSize:18,
//             lineHeight:1.6,
//             color:"rgba(255,255,255,0.5)",
//             maxWidth:650,
//             margin:"0 auto 48px",
//           }}>
//             The world's first context-aware backend generator. Design your schema visually, and let our neural engine manifest production-ready APIs in real-time.
//           </motion.p>

//           <motion.div variants={up} style={{ display:"flex", justifyContent:"center", marginBottom:64 }}>
//             <div style={{
//               display: "flex",
//               alignItems: "center",
//               background: "rgba(255, 255, 255, 0.03)",
//               border: "1px solid rgba(255, 255, 255, 0.1)",
//               borderRadius: "100px",
//               padding: "8px 8px 8px 28px",
//               width: "100%",
//               maxWidth: "640px",
//               backdropFilter: "blur(20px)",
//               boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
//             }}>
//               <input 
//                 type="text" 
//                 placeholder="What universe are we building today?" 
//                 style={{
//                   background: "transparent",
//                   border: "none",
//                   outline: "none",
//                   color: "#fff",
//                   fontSize: 16,
//                   fontWeight: 300,
//                   width: "100%",
//                 }}
//               />
//               <Link to={token ? "/projects" : "/signup"} style={{ textDecoration:"none" }}>
//                 <button className="btn-primary" style={{
//                   display:"flex", alignItems:"center", gap:10,
//                   padding:"14px 32px", borderRadius:"100px",
//                   color:"#fff", fontSize:14, fontWeight:600,
//                   cursor: "pointer",
//                 }}>
//                   <Sparkles size={16} />
//                   Manifest
//                 </button>
//               </Link>
//             </div>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* ══════════════════════════════════════════════════════
//           MARQUEE
//       ══════════════════════════════════════════════════════ */}
//       <div style={{
//         borderTop:"1px solid rgba(255,255,255,0.05)",
//         borderBottom:"1px solid rgba(255,255,255,0.05)",
//         padding:"16px 0", overflow:"hidden", position:"relative", zIndex:10,
//         background:"rgba(107, 33, 168, 0.02)",
//       }}>
//         <div className="marquee">
//           {tags.map((t,i) => (
//             <span key={i} className="label" style={{ color:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", gap:20, paddingRight:60 }}>
//               <div style={{ width:4, height:4, borderRadius:"50%", background:A }}/>
//               {t}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* ══════════════════════════════════════════════════════
//           FEATURES (REDESIGNED: HIGH-CONTRAST BLUEPRINT)
//       ══════════════════════════════════════════════════════ */}
//       <section id="features" ref={featuresRef} style={{ position:"relative", zIndex:10, padding:"160px 0", background: "#05020a" }}>
//         <div className="schematic-bg" />

//         <div style={W}>
//           <motion.div
//             initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
//             viewport={{ once:true }}
//             style={{ marginBottom:80, textAlign:"center" }}
//           >
//             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
//               <div style={{ width: 40, height: 1, background: A }} />
//               <span className="label" style={{ color: A }}>SYSTEM_CORE_V2</span>
//               <div style={{ width: 40, height: 1, background: A }} />
//             </div>
//             <h2 style={{
//               fontWeight: 900, fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-0.04em", lineHeight: 1,
//               color: "#fff", margin: '0 auto', textTransform: 'uppercase'
//             }}>
//               The <span style={{ color: A }}>Ecosystem</span>
//             </h2>
//             <p style={{ marginTop: '24px', fontSize: '18px', color: 'rgba(255,255,255,0.4)', maxWidth: '700px', margin: '24px auto 0', fontWeight: 300 }}>
//               Engineered for the Next Generation of Developers. A high-fidelity architecture for manifesting complex backend universes.
//             </p>
//           </motion.div>

//           <div className="bento-grid">
//             {features.map((f, i) => (
//               <FeatureCard key={i} {...f} delay={i * 0.05} />
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════
//           HOW IT WORKS (REDESIGNED: INTERACTIVE TIMELINE)
//       ══════════════════════════════════════════════════════ */}
//       <section id="how-it-works" ref={howItWorksRef} style={{ position:"relative", zIndex:10, padding:"160px 0", background: 'rgba(255,255,255,0.01)' }}>
//         <div style={W}>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '100px' }}>
            
//             {/* Left: Sticky Content */}
//             <div style={{ position: 'sticky', top: '150px', height: 'fit-content' }}>
//               <span className="label" style={{ color:A, marginBottom:20, display:'block' }}>The Process</span>
//               <h2 style={{
//                 fontWeight:900, fontSize:"clamp(32px, 4vw, 48px)", letterSpacing:"-0.03em", lineHeight:1.1,
//                 color:"#fff", marginBottom:32
//               }}>
//                 From Thought to <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:300, color:A }}>Production</span>
//               </h2>
//               <p style={{ fontSize: '18px', lineHeight: 1.6, color: 'rgba(255,255,255,0.4)', fontWeight: 300, maxWidth: '400px' }}>
//                 Our streamlined workflow abstracts away the complexity of backend engineering, allowing you to focus on what matters: your product.
//               </p>
              
//               <div style={{ marginTop: '48px', display: 'flex', gap: '24px' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>10x</div>
//                   <div className="label" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Faster Dev</div>
//                 </div>
//                 <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
//                 <div style={{ textAlign: 'center' }}>
//                   <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>0</div>
//                   <div className="label" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Bugs Gen</div>
//                 </div>
//               </div>
//             </div>

//             {/* Right: Timeline Steps */}
//             <div style={{ position: 'relative' }}>
//               <div className="timeline-line" />
//               <motion.div 
//                 className="timeline-progress" 
//                 style={{ scaleY: timelineScale }}
//               />
              
//               {steps.map((step, i) => (
//                 <StepItem key={i} number={step.n} title={step.title} desc={step.desc} index={i} />
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════
//           CTA
//       ══════════════════════════════════════════════════════ */}
//       <section style={{ position:"relative", zIndex:10, padding:"160px 0" }}>
//         <div style={W}>
//           <motion.div
//             initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }}
//             viewport={{ once:true }}
//             style={{
//               background:"radial-gradient(circle at top right, rgba(107, 33, 168, 0.15), transparent), rgba(255,255,255,0.02)",
//               border:"1px solid rgba(255,255,255,0.05)",
//               borderRadius:48, padding:"100px 40px", textAlign:"center",
//               position: 'relative', overflow: 'hidden'
//             }}
//           >
//             <div style={{ position:"relative", zIndex:2 }}>
//               <h2 style={{
//                 fontWeight:900, fontSize:"clamp(32px, 5vw, 56px)", letterSpacing:"-0.04em", lineHeight:1.1,
//                 color:"#fff", marginBottom:32
//               }}>
//                 Ready to Manifest Your <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:300, color:A }}>Legacy?</span>
//               </h2>
//               <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
//                 Join the elite circle of developers building tomorrow's infrastructure today.
//               </p>
//               <div style={{ display:"flex", flexWrap:"wrap", gap:20, justifyContent:"center" }}>
//                 <Link to="/signup" style={{ textDecoration:"none" }}>
//                   <button className="btn-primary" style={{
//                     padding:"18px 48px", borderRadius:100,
//                     color:"#fff", fontSize:15, fontWeight:700, letterSpacing:"0.02em",
//                   }}>
//                     Start Building Free
//                   </button>
//                 </Link>
//                 <Link to="/demo" style={{ textDecoration:"none" }}>
//                   <button className="btn-ghost" style={{
//                     padding:"18px 48px", borderRadius:100,
//                     color:"#fff", fontSize:15, fontWeight:600,
//                   }}>
//                     Watch Demo
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════
//           FOOTER
//       ══════════════════════════════════════════════════════ */}
//       <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"48px 0", position:"relative", zIndex:10 }}>
//         <div style={{ ...W, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//             <div style={{ width: 32, height: 32, borderRadius: 8, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <Rocket size={18} color="#fff" />
//             </div>
//             <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '18px' }}>MAKE-BACK</span>
//           </div>
//           <div style={{ display: 'flex', gap: 32 }}>
//             {["Twitter", "GitHub", "Discord", "Docs"].map(link => (
//               <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{link}</a>
//             ))}
//           </div>
//           <span className="label" style={{ color:"rgba(255,255,255,0.2)" }}>© 2026 NEURAL ARCHITECTS</span>
//         </div>
//       </footer>
//     </div>
//   )
// }
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Database, Code, FileText, TestTube,
  ArrowRight, CheckCircle, Sparkles, Brain, Workflow,
  Layers, Zap, Shield, Cpu, Globe, Rocket
} from "lucide-react"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { MeshDistortMaterial, Sphere, Sparkles as ThreeSparkles, Stars, Float } from "@react-three/drei"
import * as THREE from 'three'

/* ─── Inject fonts + global styles ─────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    /* ── Noise layer ─────────────────── */
    .noise {
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      opacity: 0.035; mix-blend-mode: screen;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 300px 300px;
    }

    /* ── Grid ────────────────────────── */
    .grid-bg {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
      background-size: 72px 72px;
    }

    /* ── Scan line ───────────────────── */
    @keyframes scan {
      0%   { transform: translateY(-60px); }
      100% { transform: translateY(110vh); }
    }
    .scan {
      position: fixed; left: 0; right: 0; top: 0; height: 60px;
      pointer-events: none; z-index: 9998;
      background: linear-gradient(to bottom, transparent, rgba(107, 33, 168, 0.08), transparent);
      animation: scan 10s linear infinite;
    }

    /* ── Marquee ─────────────────────── */
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .marquee { animation: marquee 30s linear infinite; display: flex; white-space: nowrap; width: max-content; }

    /* ── Orb float ───────────────────── */
    @keyframes float-a {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(1.02); }
    }

    /* ── Blink ───────────────────────── */
    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
    .blink { animation: blink 1.2s step-end infinite; }

    /* ── Vertical rail ───────────────── */
    .rail { writing-mode: vertical-rl; transform: rotate(180deg); }

    /* ── Typography helpers ──────────── */
    .label {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3em;
      text-transform: uppercase;
    }

    /* ── Neural Node (X-Factor) ─── */
    .node-card {
      background: 
        radial-gradient(circle at top right, rgba(168, 85, 247, 0.08), transparent 50%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(24px) saturate(180%);
      border-radius: 32px;
      padding: 48px;
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .node-card:hover {
      border-color: rgba(168, 85, 247, 0.4);
      background: 
        radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), transparent 50%),
        linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(13, 8, 26, 0.6) 100%);
      transform: translateY(-12px) scale(1.01);
      box-shadow: 
        0 40px 80px rgba(0, 0, 0, 0.8), 
        0 0 50px rgba(168, 85, 247, 0.15),
        inset 0 0 20px rgba(168, 85, 247, 0.05);
    }
    .node-card::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(168, 85, 247, 0.2) 0%, transparent 60%);
      opacity: 0; transition: opacity 0.5s;
      pointer-events: none;
      z-index: 1;
    }
    .node-card:hover::before { opacity: 1; }
    
    /* Glossy reflection */
    .node-card::after {
      content: '';
      position: absolute;
      top: -50%; left: -50%; width: 200%; height: 200%;
      background: linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.03) 50%, transparent 55%);
      transform: rotate(30deg);
      pointer-events: none;
      transition: transform 0.8s;
      z-index: 2;
    }
    .node-card:hover::after {
      transform: rotate(30deg) translate(20%, 20%);
    }

    .node-icon-wrapper {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05));
      border: 1px solid rgba(168, 85, 247, 0.2);
      border-radius: 16px;
      display: flex; alignItems: center; justifyContent: center;
      color: #a855f7;
      margin-bottom: 32px;
      position: relative;
    }
    .node-icon-wrapper::after {
      content: '';
      position: absolute; inset: -4px;
      border: 1px solid rgba(168, 85, 247, 0.1);
      border-radius: 20px;
      opacity: 0; transition: all 0.4s;
    }
    .node-card:hover .node-icon-wrapper::after {
      opacity: 1; inset: -8px;
    }

    /* ── Synthesis Line ─── */
    .synthesis-line {
      position: absolute;
      background: linear-gradient(90deg, transparent, #a855f7, transparent);
      height: 1px; width: 100%;
      opacity: 0.2;
    }

    /* ── HUD Elements ─── */
    .hud-corner {
      position: fixed; z-index: 100;
      width: 40px; height: 40px;
      border-color: rgba(168, 85, 247, 0.3);
      border-style: solid;
      pointer-events: none;
    }
    .hud-tl { top: 20px; left: 20px; border-top-width: 1px; border-left-width: 1px; }
    .hud-tr { top: 20px; right: 20px; border-top-width: 1px; border-right-width: 1px; }
    .hud-bl { bottom: 20px; left: 20px; border-bottom-width: 1px; border-left-width: 1px; }
    .hud-br { bottom: 20px; right: 20px; border-bottom-width: 1px; border-right-width: 1px; }

    /* ── CTA primary ─────────────────── */
    .btn-primary {
      background: linear-gradient(135deg, #6b21a8 0%, #581c87 50%, #4c1d95 100%);
      border: none; cursor: pointer; position: relative; overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 40px rgba(107, 33, 168, 0.45), 0 0 80px rgba(88, 28, 135, 0.2);
    }

    /* ── CTA ghost ───────────────────── */
    .btn-ghost {
      background: rgba(107, 33, 168, 0.07);
      border: 1px solid rgba(107, 33, 168, 0.3);
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, transform 0.2s;
    }
    .btn-ghost:hover {
      background: rgba(107, 33, 168, 0.14);
      border-color: rgba(107, 33, 168, 0.6);
      transform: translateY(-2px);
    }

    /* ── Bento Grid ──────────────────── */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .bento-grid { grid-template-columns: repeat(6, 1fr); }
    }
    @media (max-width: 640px) {
      .bento-grid { display: flex; flex-direction: column; }
    }

    /* ── Timeline ────────────────────── */
    .timeline-line {
      position: absolute; left: 28px; top: 0; bottom: 0;
      width: 2px; background: rgba(107, 33, 168, 0.1);
    }
    .timeline-progress {
      position: absolute; left: 28px; top: 0; width: 2px;
      background: linear-gradient(to bottom, transparent, #6b21a8, #6b21a8);
      transform-origin: top;
    }
  `}</style>
)

/* ─── 3D Universe Portal ────────────────────────────────────────────── */
const PortalOrb = () => {
  const meshRef = useRef(null)
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const speed = 1.0 
    
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.1 * speed
      meshRef.current.rotation.y = t * 0.15 * speed
       const scale = 1 + Math.sin(t * 0.5) * (0.05 * speed)
       meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group>
      <Sphere ref={meshRef} args={[1.2, 128, 128]}>
        <MeshDistortMaterial 
          color="#581c87"
          emissive="#6b21a8"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.9}
          distort={0.4}
          speed={2} 
        />
      </Sphere>
      <Sphere args={[1.5, 64, 64]}>
        <meshBasicMaterial color="#581c87" wireframe={true} transparent opacity={0.05} />
      </Sphere>
      <ThreeSparkles count={800} scale={5} size={3} speed={0.5} color="#6b21a8" opacity={0.5} />
    </group>
  )
}

const UniversePortal = () => {
  return (
    <div style={{ position:"absolute", inset:0, zIndex: 0, overflow:"hidden", pointerEvents:"none" }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#6b21a8" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#581c87" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <PortalOrb />
        </Float>
      </Canvas>
    </div>
  )
}

/* ─── Components ───────────────────────────────────────────────────── */

const FeatureCard = ({ icon: Icon, title, desc, tag, span = "col-span-4", delay = 0 }) => {
  const cardRef = useRef(null)
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--x', `${x}px`)
    cardRef.current.style.setProperty('--y', `${y}px`)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
      className={`node-card ${span}`}
    >
      {/* Color Shade Accent */}
      <div style={{ 
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)',
        zIndex: 2
      }} />

      <div className="node-icon-wrapper  flex justify-center items-center">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <span className="label" style={{ color: '#a855f7', fontSize: '10px', letterSpacing: '0.2em' }}>{tag}</span>
      </div>

      <h3 style={{ 
        fontSize: '24px', fontWeight: 700, color: '#fff', 
        marginBottom: '16px', letterSpacing: '-0.02em'
      }}>
        {title}
      </h3>
      
      <p style={{ 
        fontSize: '16px', lineHeight: 1.7, 
        color: 'rgba(255,255,255,0.4)', fontWeight: 300
      }}>
        {desc}
      </p>

      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />
        <div style={{ flexGrow: 1, height: 1, background: 'rgba(168, 85, 247, 0.1)' }} />
        <ArrowRight size={16} color="rgba(168, 85, 247, 0.5)" />
      </div>
    </motion.div>
  )
}

const StepItem = ({ number, title, desc, index }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.2, ease: [0.23, 1, 0.32, 1] }}
      style={{ 
        position: 'relative', 
        paddingLeft: '100px', 
        paddingBottom: '100px',
      }}
    >
      {/* Connector */}
      <div style={{ 
        position: 'absolute', left: '39px', top: '40px', bottom: 0,
        width: '2px', background: 'linear-gradient(to bottom, #a855f7, transparent)',
        opacity: 0.2, display: index === 3 ? 'none' : 'block'
      }} />

      {/* Step Indicator */}
      <div style={{ 
        position: 'absolute', left: '0', top: '0',
        width: '80px', height: '80px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: isInView ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
          border: `1px solid ${isInView ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '50%',
          transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
          transform: isInView ? 'scale(1)' : 'scale(0.5)',
        }} />
        <span style={{ 
          fontSize: '24px', fontWeight: 900, 
          color: isInView ? '#fff' : 'rgba(255,255,255,0.2)',
          fontFamily: 'monospace',
          transition: 'color 0.8s'
        }}>
          {number}
        </span>
      </div>

      <div style={{ paddingTop: 12 }}>
        <h3 style={{ 
          fontSize: '32px', fontWeight: 800, color: '#fff', 
          marginBottom: '16px', letterSpacing: '-0.03em' 
        }}>
          {title}
        </h3>
        <p style={{ 
          fontSize: '18px', lineHeight: 1.8, 
          color: 'rgba(255,255,255,0.4)', fontWeight: 300,
          maxWidth: '600px'
        }}>
          {desc}
        </p>
      </div>
    </motion.div>
  )
}

/* ─── Main ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [token, setToken] = useState("")
  const heroRef  = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)

  useEffect(() => {
    const jwt = localStorage.getItem("token")
    if (jwt) setToken(jwt)
  }, [])

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY  = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const { scrollYProgress: howItWorksProgress } = useScroll({
    target: howItWorksRef,
    offset: ["start end", "end start"]
  })
  const timelineScale = useSpring(howItWorksProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }
  const up = {
    hidden:{ opacity:0, y:30 },
    show:{ opacity:1, y:0, transition:{ duration:0.65, ease: "easeOut" } },
  }

  const features = [
    { icon: Database, tag: "BUILDER", title: "Visual Schema Builder", desc: "Design your database schema with an intuitive drag-and-drop interface. Create ER diagrams that automatically generate optimized database structures.", span: "lg:col-span-8 md:col-span-6" },
    { icon: Brain, tag: "INTELLIGENCE", title: "AI-Powered Generation", desc: "Leverage advanced AI to generate APIs, suggest schema improvements, and create comprehensive documentation from natural language prompts.", span: "lg:col-span-4 md:col-span-6" },
    { icon: Zap, tag: "PERSISTENCE", title: "Context-Persistent APIs", desc: "Generate Node.js + Express APIs that maintain context across your entire project, eliminating repetitive schema redefinition.", span: "lg:col-span-4 md:col-span-6" },
    { icon: Shield, tag: "REGENERABLE", title: "Regenerable Architecture", desc: "Modify and regenerate your APIs with version tracking and rollback capabilities for seamless iterative development.", span: "lg:col-span-4 md:col-span-6" },
    { icon: Globe, tag: "DOCUMENTATION", title: "Live Documentation", desc: "Auto-generate OpenAPI/Swagger documentation that updates in real-time as you modify your APIs and schemas.", span: "lg:col-span-4 md:col-span-6" },
    { icon: Code, tag: "TESTING", title: "Integrated Testing", desc: "Built-in API testing interface with auto-generated test cases for comprehensive endpoint validation.", span: "lg:col-span-12 md:col-span-12" },
  ]

  const steps = [
    { n: "01", title: "Design Your Schema", desc: "Use our visual builder to create your database schema or let AI suggest one based on your project description." },
    { n: "02", title: "Generate APIs", desc: "Create API modules with natural language prompts. Our AI generates complete controllers, models, and middleware." },
    { n: "03", title: "Test & Document", desc: "Automatically generated documentation and testing interface let you validate your APIs instantly." },
    { n: "04", title: "Deploy & Scale", desc: "Export your complete backend or deploy directly to your preferred cloud platform." },
  ]

  const tags = ["SCHEMA BUILDER","AI GENERATION","NODE.JS","EXPRESS","OPENAPI","SWAGGER","CONTEXT API","VERSION CONTROL","INTEGRATED TESTING","DEPLOY ANYWHERE","SCHEMA BUILDER","AI GENERATION","NODE.JS","EXPRESS","OPENAPI","SWAGGER","CONTEXT API","VERSION CONTROL","INTEGRATED TESTING","DEPLOY ANYWHERE"]

  const W = { maxWidth:1200, margin:"0 auto", padding:"0 48px", width:"100%" }
  const A = "#6b21a8"

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#05020a", color:"#fff", fontFamily:"'Inter',sans-serif", overflowX:"hidden", position:"relative" }}>
      <Styles/>
      <div className="noise"/>
      <div className="scan"/>
      <div className="grid-bg"/>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
        <UniversePortal/>

        <div className="rail label" style={{
          position:"absolute", left:16, top:"50%", color:"rgba(255,255,255,0.1)",
          userSelect:"none", zIndex: 10
        }}>
          MAKE-BACK · AI BACKEND ENGINE · v2.0
        </div>
        <div className="label" style={{
          position:"absolute", right:16, top:"50%",
          writingMode:"vertical-rl", color:"rgba(255,255,255,0.1)",
          userSelect:"none", zIndex: 10
        }}>
          BEYOND CODE — INTO MANIFESTATION
        </div>

        <motion.div style={{ y:heroY, opacity:heroOp, ...W, position:"relative", zIndex:2, textAlign: "center" }}
          initial="hidden" animate="show" variants={stagger}
        >
          <motion.div variants={up} style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:36 }}>
            <span className="blink" style={{ width:6, height:6, borderRadius:"50%", background:"#a855f7", boxShadow: '0 0 10px #a855f7' }}/>
            <span className="label" style={{ color:"rgba(255,255,255,0.4)", letterSpacing: '0.5em' }}>
              QUANTUM ENGINE ACTIVE
            </span>
          </motion.div>

          <div style={{ marginBottom:32 }}>
            <motion.div variants={up} style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px 24px"
            }}>
              <span style={{
                fontSize:"clamp(50px, 9vw, 110px)",
                fontWeight:900,
                lineHeight:0.9,
                letterSpacing:"-0.05em",
                color:"#fff",
              }}>
                Build
              </span>
              <span style={{
                fontFamily:"'Playfair Display',serif",
                fontStyle:"italic",
                fontWeight:300,
                fontSize:"clamp(52px, 9.5vw, 115px)",
                lineHeight:0.9,
                letterSpacing:"-0.02em",
                color: "#a855f7",
              }}>
                Backends
              </span>
              <span style={{
                fontSize:"clamp(50px, 9vw, 110px)",
                fontWeight:900,
                lineHeight:0.9,
                letterSpacing:"-0.05em",
                color:"#fff",
              }}>
                Intelligently.
              </span>
            </motion.div>
          </div>

          <motion.p variants={up} style={{
            fontWeight:300,
            fontSize:18,
            lineHeight:1.6,
            color:"rgba(255,255,255,0.5)",
            maxWidth:650,
            margin:"0 auto 48px",
          }}>
            The world's first context-aware backend generator. Design your schema visually, and let our neural engine manifest production-ready APIs in real-time.
          </motion.p>

          <motion.div variants={up} style={{ display:"flex", justifyContent:"center", marginBottom:64 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "100px",
              padding: "8px 8px 8px 28px",
              width: "100%",
              maxWidth: "640px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            }}>
              <input 
                type="text" 
                placeholder="What universe are we building today?" 
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 300,
                  width: "100%",
                }}
              />
              <Link to={token ? "/projects" : "/signup"} style={{ textDecoration:"none" }}>
                <button className="btn-primary" style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"14px 32px", borderRadius:"100px",
                  color:"#fff", fontSize:14, fontWeight:600,
                  cursor: "pointer",
                }}>
                  <Sparkles size={16} />
                  Manifest
                </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════════════════════ */}
      <div style={{
        borderTop:"1px solid rgba(255,255,255,0.05)",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        padding:"16px 0", overflow:"hidden", position:"relative", zIndex:10,
        background:"rgba(107, 33, 168, 0.02)",
      }}>
        <div className="marquee">
          {tags.map((t,i) => (
            <span key={i} className="label" style={{ color:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", gap:20, paddingRight:60 }}>
              <div style={{ width:4, height:4, borderRadius:"50%", background:A }}/>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* HUD Overlay */}
      <div className="hud-corner hud-tl" />
      <div className="hud-corner hud-tr" />
      <div className="hud-corner hud-bl" />
      <div className="hud-corner hud-br" />

      {/* ══════════════════════════════════════════════════════
          FEATURES (REDESIGNED: THE NEURAL FABRIC)
      ══════════════════════════════════════════════════════ */}
      <section id="features" ref={featuresRef} style={{ position:"relative", zIndex:10, padding:"200px 0", background: "#05020a" }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <div className="synthesis-line" style={{ top: '20%' }} />
          <div className="synthesis-line" style={{ top: '50%' }} />
          <div className="synthesis-line" style={{ top: '80%' }} />
        </div>

        <div style={W}>
          <div style={{ textAlign: 'center', marginBottom: 100 }}>
            <motion.div
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration: 1 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 12, height: 12, background: A, borderRadius: '2px' }} />
                <span className="label" style={{ color: A, letterSpacing: '0.3em' }}>SYSTEM_CORE_V2</span>
              </div>
              <h2 style={{
                fontWeight: 900, fontSize: "clamp(40px, 6vw, 80px)", letterSpacing: "-0.05em", lineHeight: 0.9,
                color: "#fff", textTransform: 'uppercase', marginBottom: 24
              }}>
                Everything You Need to <br/>
                <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:300, color: A, textTransform: 'none' }}>Build Modern Backends</span>
              </h2>
              <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)', maxWidth: '700px', margin: '0 auto', fontWeight: 300, lineHeight: 1.6 }}>
                From visual schema design to AI-powered API generation, Make-Back provides all the tools you need.
              </p>
            </motion.div>
          </div>

          <div className="bento-grid">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS (REDESIGNED: FLOW SYNTHESIS)
      ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" ref={howItWorksRef} style={{ position:"relative", zIndex:10, padding:"200px 0", background: '#000' }}>
        <div style={W}>
          <div style={{ textAlign: 'center', marginBottom: 160 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ display: 'inline-block', padding: '12px 24px', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '100px', marginBottom: 32 }}
            >
              <span className="label" style={{ color: A }}>SYNTHESIS_PROTOCOL</span>
            </motion.div>
            <h2 style={{
              fontWeight: 900, fontSize: "clamp(40px, 8vw, 120px)", letterSpacing: "-0.06em", lineHeight: 0.8,
              color: "#fff", textTransform: 'uppercase'
            }}>
              How <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:300, color: A, textTransform: 'none' }}>Make-Back</span> Works
            </h2>
            <p style={{ marginTop: 40, fontSize: '20px', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
              Four simple steps to transform your ideas into production-ready backends.
            </p>
          </div>

          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {steps.map((step, i) => (
              <StepItem key={i} number={step.n} title={step.title} desc={step.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA (REDESIGNED: TERMINAL ACCESS)
      ══════════════════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:10, padding:"160px 0" }}>
         <div style={W}>
           <motion.div
            initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true }}
            style={{
              background:"radial-gradient(circle at top right, rgba(107, 33, 168, 0.15), transparent), rgba(255,255,255,0.02)",
              border:"1px solid rgba(255,255,255,0.05)",
              borderRadius:48, padding:"100px 40px", textAlign:"center",
              position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ position:"relative", zIndex:2 }}>
              <h2 style={{
                fontWeight:900, fontSize:"clamp(32px, 5vw, 56px)", letterSpacing:"-0.04em", lineHeight:1.1,
                color:"#fff", marginBottom:32
              }}>
                Ready to Manifest Your <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:300, color:A }}>Legacy?</span>
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
                Join the elite circle of developers building tomorrow's infrastructure today.
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:20, justifyContent:"center" }}>
                <Link to="/signup" style={{ textDecoration:"none" }}>
                  <button className="btn-primary" style={{
                    padding:"18px 48px", borderRadius:100,
                    color:"#fff", fontSize:15, fontWeight:700, letterSpacing:"0.02em",
                  }}>
                    Start Building Free
                  </button>
                </Link>
                <Link to="/demo" style={{ textDecoration:"none" }}>
                  <button className="btn-ghost" style={{
                    padding:"18px 48px", borderRadius:100,
                    color:"#fff", fontSize:15, fontWeight:600,
                  }}>
                    Watch Demo
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
         </div>
       </section>


      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"48px 0", position:"relative", zIndex:10 }}>
        <div style={{ ...W, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Rocket size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '18px' }}>MAKE-BACK</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {["Twitter", "GitHub", "Discord", "Docs"].map(link => (
              <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{link}</a>
            ))}
          </div>
          <span className="label" style={{ color:"rgba(255,255,255,0.2)" }}>© 2026 NEURAL ARCHITECTS</span>
        </div>
      </footer>
    </div>
  )
}
