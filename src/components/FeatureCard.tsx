// ========================================
// FeatureCard Component
// Reusable card for displaying features with icon, title, and description
// ========================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex bg-gray-50 px-3 py-2 rounded-lg flex-col items-center text-center gap-2 max-w-[180px]">
      {/* Icon Container (smaller) */}
      <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-full">
        <div className="text-blue-600 text-2xl">{icon}</div>
      </div>

      {/* Title (smaller) */}
      <h3 className="text-gray-900 font-semibold text-sm">{title}</h3>

      {/* Description (tighter) */}
      <p className="text-gray-600 text-xs leading-snug max-w-[160px]">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
