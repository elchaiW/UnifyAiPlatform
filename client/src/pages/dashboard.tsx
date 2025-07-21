import Navigation from "@/components/Navigation";
import AIModelCard from "@/components/AIModelCard";
import ProcessingWorkflow from "@/components/ProcessingWorkflow";
import RequestForm from "@/components/RequestForm";
import ProcessingHistory from "@/components/ProcessingHistory";

const aiModels = [
  {
    name: "Claude",
    description: "Compliance, regulatory, and legal documents",
    specializations: ["Legal Analysis", "Compliance", "Regulatory"],
    icon: "C",
    color: "blue" as const
  },
  {
    name: "ChatGPT",
    description: "General knowledge, content creation, summaries",
    specializations: ["Content Creation", "Summaries", "General Knowledge"],
    icon: "G",
    color: "green" as const
  },
  {
    name: "Gemini",
    description: "Marketing, social media, business strategies",
    specializations: ["Marketing", "Social Media", "Business Strategy"],
    icon: "G",
    color: "purple" as const
  },
  {
    name: "Grok",
    description: "Coding, debugging, technical analysis",
    specializations: ["Coding", "Debugging", "Technical Analysis"],
    icon: "G",
    color: "orange" as const
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-accent">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              <span className="text-white/90 text-sm font-medium">Powered by 4 Leading AI Models</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Intelligent AI
              <br />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Routing Platform
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Submit any prompt or document and watch our intelligent classifier automatically route it to the perfect AI model. 
              <strong className="text-white">Claude</strong> for legal compliance, <strong className="text-white">ChatGPT</strong> for content creation, 
              <strong className="text-white">Gemini</strong> for marketing strategies, and <strong className="text-white">Grok</strong> for technical analysis.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4">
                <div className="text-3xl font-bold text-white">4</div>
                <div className="text-white/70 text-sm">AI Models</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-white/70 text-sm">Accuracy</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4">
                <div className="text-3xl font-bold text-white">&lt;2s</div>
                <div className="text-white/70 text-sm">Response Time</div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RequestForm />
          
          {/* AI Models Overview */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-primary mb-8">AI Specializations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {aiModels.map((model, index) => (
                <AIModelCard key={index} {...model} />
              ))}
            </div>
          </div>

          {/* Processing History */}
          <div className="mt-16">
            <ProcessingHistory />
          </div>
        </div>
      </section>

      <ProcessingWorkflow />

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to streamline your AI workflow and maximize productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="ai-card hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                alt="AI neural network" 
                className="w-full h-48 object-cover rounded-lg mb-6" 
              />
              <h3 className="text-xl font-semibold text-primary mb-3">Intelligent Routing</h3>
              <p className="text-muted-foreground">
                Advanced classifier automatically selects the optimal AI model for your specific task and requirements.
              </p>
            </div>

            <div className="ai-card hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                alt="Document processing" 
                className="w-full h-48 object-cover rounded-lg mb-6" 
              />
              <h3 className="text-xl font-semibold text-primary mb-3">Document Processing</h3>
              <p className="text-muted-foreground">
                Support for PDF, DOCX, and TXT files with advanced text extraction and OCR capabilities.
              </p>
            </div>

            <div className="ai-card hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                alt="Analytics dashboard" 
                className="w-full h-48 object-cover rounded-lg mb-6" 
              />
              <h3 className="text-xl font-semibold text-primary mb-3">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Comprehensive insights into AI model performance, usage patterns, and processing efficiency.
              </p>
            </div>

            <div className="ai-card hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                alt="Secure cloud" 
                className="w-full h-48 object-cover rounded-lg mb-6" 
              />
              <h3 className="text-xl font-semibold text-primary mb-3">Supabase Integration</h3>
              <p className="text-muted-foreground">
                Secure, scalable backend with real-time data synchronization and enterprise-grade security.
              </p>
            </div>

            <div className="ai-card hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                alt="Team collaboration" 
                className="w-full h-48 object-cover rounded-lg mb-6" 
              />
              <h3 className="text-xl font-semibold text-primary mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Share results, collaborate on projects, and maintain a centralized knowledge base for your team.
              </p>
            </div>

            <div className="ai-card hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                alt="API interface" 
                className="w-full h-48 object-cover rounded-lg mb-6" 
              />
              <h3 className="text-xl font-semibold text-primary mb-3">API Integration</h3>
              <p className="text-muted-foreground">
                Robust API with comprehensive documentation for seamless integration into your existing workflows.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
