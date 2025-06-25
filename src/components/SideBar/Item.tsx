import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ItemProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  onIconClick?: (event: React.MouseEvent) => void;
  isActive?: boolean;
  trailingItem?: React.ReactElement;
}

export function Item({
  label,
  onClick,
  onIconClick,
  icon: Icon,
  isActive = false,
  trailingItem,
}: ItemProps) {
  return (
    <div
      className={cn(
        'group min-h-[32px] text-sm py-2 pr-3 w-full flex items-center text-neutral-700 dark:text-neutral-300 font-medium transition-all duration-150',
        'hover:text-neutral-900 dark:hover:text-neutral-100',
        isActive && 'text-neutral-900 dark:text-neutral-100'
      )}
      onClick={onClick}
      role="button"
      style={{ paddingLeft: '8px' }}
    >
      <div 
        className="shrink-0 w-6 h-6 mr-2 flex items-center justify-center rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150"
        onClick={onIconClick}
      >
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-neutral-600 dark:group-hover:text-neutral-400" />
      </div>
      <span className="truncate flex-1 select-none">{label}</span>
      {trailingItem}
    </div>
  );
}
