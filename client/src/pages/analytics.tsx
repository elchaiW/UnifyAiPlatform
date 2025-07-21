import Navigation from "@/components/Navigation";
import AnalyticsCards from "@/components/AnalyticsCards";
import ProcessingHistory from "@/components/ProcessingHistory";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-primary mb-4">Performance Analytics</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Track AI model performance, processing history, and gain insights into your workflow efficiency
            </p>
          </div>

          <AnalyticsCards />

          {/* Detailed Processing History */}
          <div className="mt-12">
            <ProcessingHistory />
          </div>
        </div>
      </section>
    </div>
  );
}
