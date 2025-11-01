import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  Database,
  Code,
  FileText,
  TestTube,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Brain,
  Workflow,
} from "lucide-react"
import { motion } from "framer-motion"


export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [token , setToken] = useState("");
  useEffect(() => {
    const jwt = localStorage.getItem("token");
    if( jwt ){
      setToken(jwt)
    }
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Visual Schema Builder",
      description:
        "Design your database schema with an intuitive drag-and-drop interface. Create ER diagrams that automatically generate optimized database structures.",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description:
        "Leverage advanced AI to generate APIs, suggest schema improvements, and create comprehensive documentation from natural language prompts.",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Context-Persistent APIs",
      description:
        "Generate Node.js + Express APIs that maintain context across your entire project, eliminating repetitive schema redefinition.",
    },
    {
      icon: <Workflow className="w-6 h-6" />,
      title: "Regenerable Architecture",
      description:
        "Modify and regenerate your APIs with version tracking and rollback capabilities for seamless iterative development.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Live Documentation",
      description:
        "Auto-generate OpenAPI/Swagger documentation that updates in real-time as you modify your APIs and schemas.",
    },
    {
      icon: <TestTube className="w-6 h-6" />,
      title: "Integrated Testing",
      description:
        "Built-in API testing interface with auto-generated test cases for comprehensive endpoint validation.",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Design Your Schema",
      description:
        "Use our visual builder to create your database schema or let AI suggest one based on your project description.",
    },
    {
      number: "02",
      title: "Generate APIs",
      description:
        "Create API modules with natural language prompts. Our AI generates complete controllers, models, and middleware.",
    },
    {
      number: "03",
      title: "Test & Document",
      description:
        "Automatically generated documentation and testing interface let you validate your APIs instantly.",
    },
    {
      number: "04",
      title: "Deploy & Scale",
      description:
        "Export your complete backend or deploy directly to your preferred cloud platform.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
      </div>

      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Backend Development
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
              Build Backends
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Visually & Intelligently
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline backend development with AI-powered visual schema design, context-persistent API generation,
              and automated documentation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              
              { !token ?  <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 px-8 py-6 text-lg"
                >
                  Start Building Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link> : <Link to="/projects">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 px-8 py-6 text-lg"
                >
                  Start Building Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
               }
              <Link to="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="hover:border-violet-600  text-white bg-violet-700/50 px-8 py-6 text-lg"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Free Forever Plan
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Deploy Anywhere
              </div>
            </div>
          </div>
        </div>
      </section> 
      
      <section className="">
        {/* Animated background elements */}

        <style jsx>{`
          h1 {
            font-family: 'Arial Black', 'Helvetica', sans-serif;
            -webkit-text-stroke: 1px rgba(6, 182, 212, 0.3);
            text-rendering: optimizeLegibility;
          }
          .neon-glow {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
            transition: all 0.3s ease;
          }
          .neon-glow:hover {
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.7), 0 0 60px rgba(251, 191, 36, 0.3);
          }
          .glassmorphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-reverse {
            animation: float 4s ease-in-out infinite reverse;
          }
          .animate-spin-slow {
            animation: spin 20s linear infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes scaleX {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
        `}</style>
      </section>

      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Everything You Need to Build Modern Backends
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From visual schema design to AI-powered API generation, Make-Back provides all the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <div className="text-blue-400">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How Make-Back Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Four simple steps to transform your ideas into production-ready backends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                    <span className="text-white font-bold text-lg">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <div className="w-full h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl p-12 border border-gray-700/50 backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Your Backend Development?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are building faster, smarter backends with Make-Back.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 px-8 py-6 text-lg"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-violet-600 hover:cursor-default hover:text-violet-800 text-white bg-violet-700/50 px-8 py-6 text-lg"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  )
}
