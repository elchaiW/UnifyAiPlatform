import { Badge } from "@/components/ui/badge";

interface AIModelCardProps {
  name: string;
  description: string;
  specializations: string[];
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
  blue: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800'
  },
  green: {
    border: 'border-l-green-500',
    bg: 'bg-green-500',
    badge: 'bg-green-100 text-green-800'
  },
  purple: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-800'
  },
  orange: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-800'
  }
};

export default function AIModelCard({ name, description, specializations, icon, color }: AIModelCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div className={`ai-card border-l-4 ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-2">{name}</h3>
          <p className="text-muted-foreground mb-3">{description}</p>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec, index) => (
              <Badge key={index} className={colors.badge}>
                {spec}
              </Badge>
            ))}
          </div>
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ml-4`}>
          <span className="text-white font-bold text-lg">{icon}</span>
        </div>
      </div>
    </div>
  );
}
