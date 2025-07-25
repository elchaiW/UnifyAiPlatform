import { CheckCircle, Clock, FileText, Lightbulb, Zap } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Input",
    description: "Submit prompt or upload document",
    color: "bg-secondary"
  },
  {
    icon: Clock,
    title: "Preprocessing",
    description: "Text extraction and analysis",
    color: "bg-accent"
  },
  {
    icon: Lightbulb,
    title: "Classification",
    description: "AI-powered categorization",
    color: "bg-purple-500"
  },
  {
    icon: Zap,
    title: "Processing",
    description: "Optimal AI model execution",
    color: "bg-indigo-500"
  },
  {
    icon: CheckCircle,
    title: "Results",
    description: "Structured output delivery",
    color: "bg-green-500"
  }
];

export default function ProcessingWorkflow() {
  return (
    <section className="dark-gradient-bg py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Intelligent Processing Workflow</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our advanced classifier automatically routes your requests to the most suitable AI model for optimal results
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid md:grid-cols-5 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-300 text-sm">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Processing Example */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-white mb-6">Example Processing</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-3">Input</h4>
              <p className="text-gray-300 text-sm italic">&quot;Review this contract for compliance issues.&quot;</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-3">Classification</h4>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">Legal/Compliance</span>
                <span className="text-gray-300 text-sm">→ Claude</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-3">Output</h4>
              <p className="text-gray-300 text-sm">Structured compliance analysis with recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
