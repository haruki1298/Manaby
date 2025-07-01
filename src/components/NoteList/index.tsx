import { cn } from '@/lib/utils';
import { NoteItem } from './NoteItem';
import { useNoteStore } from '@/modules/notes/note.state';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { Note } from '@/modules/notes/note.entity';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NoteListProps {
  layer?: number;
  parentId?: number;
}

export function NoteList({ layer = 0, parentId }: NoteListProps) {
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id != null ? parseInt(params.id) : undefined;
  const navigate = useNavigate();
  const noteStore = useNoteStore()
  const notes = noteStore.getAll();
  const { currentUser } = useCurrentUserStore();
  const [expanded, setExpanded] = useState<Map<number, boolean>>(new Map());


  const createChild = async (e: React.MouseEvent, parentId: number) => {
    e.stopPropagation();
    const newNote = await noteRepository.create(currentUser!.id, { parentId });
    noteStore.set([newNote]);
    setExpanded((prev)=> prev.set(parentId, true));
    moveToDetail(newNote.id);
  };

  const fetchChildren = async(e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const children = await noteRepository.find(currentUser!.id, note.id);
    if (children == null) return;
    noteStore.set(children);
    setExpanded((prev) => {
      const newExpanded = new Map(prev);
      newExpanded.set(note.id, !prev.get(note.id))
      return newExpanded;
    })
  };

  const deleteNote = async (e: React.MouseEvent, noteId: number) => {
    e.stopPropagation();
    await noteRepository.delete(noteId);
    noteStore.delete(noteId);
    navigate('/');
  };


  const moveToDetail = (noteId: number) => {
    navigate(`/notes/${noteId}`);
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-center py-8 px-4',
          layer === 0 && 'hidden',
          notes.filter((note) => note.parent_document == parentId).length > 0 && 'hidden'
        )}
        style={{ paddingLeft: layer ? `${layer * 12 + 25}px` : undefined }}
      >
        <div className="text-center">
          <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
            {t('notes.noNotes')}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-400 mt-1">
            {t('notes.noNotesDescription')}
          </p>
        </div>
      </div>
      {notes
      .filter((note) => note.parent_document == parentId)
      .map((note) => {
        return (
          <div key={note.id} className="transition-all duration-200">
            <NoteItem 
              note= {note} 
              layer={layer}
              isSelected={id == note.id}
              expanded={expanded.get(note.id)} 
              onClick={() => moveToDetail(note.id)}
              onExpand={(e: React.MouseEvent) => fetchChildren(e, note)}
              onCreate={(e) => createChild(e, note.id)}
              onDelete={(e) => deleteNote(e, note.id)}
              />
              {expanded.get(note.id) && (
                <div className="transition-all duration-300 ease-in-out">
                  <NoteList layer={layer + 1} parentId={note.id} />
                </div>
              )}
          </div>
        );
      })}
    </>
  );
}
