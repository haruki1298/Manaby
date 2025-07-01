import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Note } from '@/modules/notes/note.entity';
import { useDebouncedCallback } from 'use-debounce';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchModalProps {
  isOpen: boolean;
  notes: Note[];
  onItemSelect: (noteId: number) => void;
  onKeywordChanged: (keyword: string) => void;
  onClose: () => void;
}

export function SearchModal({
  isOpen,
  notes,
  onItemSelect,
  onKeywordChanged,
  onClose,
}: SearchModalProps) {
  const { t } = useTranslation();
  const debounced = useDebouncedCallback(onKeywordChanged, 500);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command shouldFilter={false} className="rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg">
        <CommandInput 
          placeholder={`🔍 ${t('search.placeholder')}`} 
          onValueChange={debounced}
          className="border-none focus:ring-0"
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="w-12 h-12 text-neutral-400 mb-4" />
              <p className="text-neutral-500 dark:text-neutral-300 font-medium">{t('search.noResults')}</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-400 mt-1">{t('search.noResultsDescription')}</p>
            </div>
          </CommandEmpty>
          <CommandGroup heading={t('search.title')}>
            {notes?.map((note) => (
              <CommandItem
                key={note.id}
                title={note.title ?? t('notes.untitled')}
                onSelect={() => onItemSelect(note.id)}
                className="flex items-center gap-x-3 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors duration-150"
              >
                <FileText className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{note.title ?? t('notes.untitled')}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
