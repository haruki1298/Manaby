import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight, FileText, MoreHorizontal, Plus, Trash } from 'lucide-react';
import { Item } from '../SideBar/Item';
import { cn } from '@/lib/utils';
import { Note } from '@/modules/notes/note.entity';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  note: Note;
  expanded?: boolean;
  layer?: number;
  isSelected?: boolean;
  onExpand?: (event: React.MouseEvent) => void;
  onCreate?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
  onClick?: () => void;
}

export function NoteItem({
  note,
  onClick,
  layer = 0,
  expanded = false,
  isSelected = false,
  onCreate,
  onDelete,
  onExpand,
}: Props) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = ()=>{
    return expanded ? ChevronDown: isHovered ? ChevronRight : FileText;
  };

  const menu = (
    <div className={cn(
      'ml-auto flex items-center gap-x-1 transition-opacity duration-200',
      !isHovered && 'opacity-0'
    )}>
      <DropdownMenu>
        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
          <div
            className="h-6 w-6 flex items-center justify-center ml-auto rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150"
            role="button"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-60 shadow-lg border border-neutral-200 dark:border-neutral-700"
          align="start"
          side="right"
          forceMount
        >
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
          >
            <Trash className="w-4 h-4 mr-2" />
            <span>{t('common.delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className="h-6 w-6 flex items-center justify-center ml-auto rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150"
        role="button"
        onClick={onCreate}
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      className={cn(
        "group relative transition-all duration-150 rounded-md mx-1 my-0.5",
        "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
        isSelected && "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
      )}
      style={{ paddingLeft: layer != null ? `${layer * 12 + 12}px` : '12px' }}
    >
      <Item
        label={note.title ?? t('notes.untitled')}
        icon={getIcon()}
        onIconClick={onExpand}
        trailingItem={menu}
        isActive={isHovered || isSelected}
      />
    </div>
  );
}
