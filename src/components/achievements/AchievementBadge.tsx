
import { ReactNode } from 'react';

interface AchievementBadgeProps {
  name: string;
  description: string;
  unlocked: boolean;
  icon: ReactNode;
}

const AchievementBadge = ({ name, description, unlocked, icon }: AchievementBadgeProps) => {
  return (
    <div 
      className={`rounded-lg p-4 border ${
        unlocked 
          ? "border-cutelist-primary/30 bg-cutelist-primary/10" 
          : "border-gray-700 bg-gray-800/50 opacity-60"
      }`}
    >
      <div className="flex items-center">
        <div className={`rounded-full p-2 mr-3 ${
          unlocked 
            ? "bg-cutelist-primary/20 text-cutelist-primary" 
            : "bg-gray-700 text-gray-400"
        }`}>
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;
