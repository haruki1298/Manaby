import { supabase } from "@/lib/supabase";

export const noteRepository = {
    async create(userId: string, params: { title?: string; parentId?: number }) {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: userId,
            title: params.title,
            parent_document: params.parentId,
          },
        ])
        .select()
        .single();
      if (error != null) throw new Error(error.message);
      return data;
    },
    async find(userId: string, parentDocumentId?: number) {
      const query = supabase
        .from('notes')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      const { data } = 
        parentDocumentId != null 
          ? await query.eq('parent_document', parentDocumentId)
          : await query.is('parent_document', null);
      return data;
    },

    async findByKeyword(userId: string, keyword: string) {
      const { data } = await supabase
      .from('notes')
      .select()
      .eq('user_id', userId)
      .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
      .order('created_at', { ascending: false });
      return data;
    },

    async findOne(userId: string, id: number) {
      const {data} = await supabase
        .from('notes')
        .select()
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        return data;
    },

    async updata(id:number, note: {title?: string; content?: string}) {
      const { data } = await supabase
        .from('notes')
        .update(note)
        .eq('id', id)
        .select()
        .single();
      return data;
    },
    async setPublic(id: number, isPublic: boolean) {
      const { data, error } = await supabase
        .from('notes')
        .update({ is_public: isPublic })
        .eq('id', id)
        .select()
        .single();
      if (error != null) throw new Error(error.message);
      return data;
    },
    async delete(id: number){
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      if(error !== null) throw new Error(error.message);
      return true;
    },    async findPublicNotes() {
      const { data, error } = await supabase
        .from('notes')
        .select('*, creator_name')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (error != null) throw new Error(error.message);
      return data;
    },

    async getPublicNoteWithCreator(noteId: number) {
      const { data: note, error } = await supabase
        .from('notes')
        .select('*, creator_name')
        .eq('id', noteId)
        .eq('is_public', true)
        .single();
      
      if (error != null) throw new Error(error.message);
      return note;
    },    // 共同編集機能（Supabase関数使用版）
    async shareNoteByEmail(noteId: number, userEmail: string, permission: 'read' | 'write' = 'write') {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error('認証が必要です');

      console.log('Sharing note:', { noteId, userEmail, permission });

      try {
        // Supabase関数を使用してメールアドレスで共同編集者を招待
        const { data: result, error } = await (supabase as any)
          .rpc('invite_collaborator_by_email', { 
            note_id_param: noteId, 
            user_email_param: userEmail, 
            permission_param: permission 
          });

        if (error) {
          console.error('Invitation error:', error);
          throw new Error(`共有に失敗しました: ${error.message}`);
        }

        if (!result.success) {
          throw new Error(result.error || '共有に失敗しました');
        }

        console.log('Successfully shared note:', result);
        return result;
      } catch (err) {
        console.error('Share error:', err);
        throw err;
      }
    },

    async addCollaborator(noteId: number, userEmail: string, permission: 'read' | 'write' = 'write') {
      return this.shareNoteByEmail(noteId, userEmail, permission);
    },

    async getCollaborators(noteId: number) {
      const { data, error } = await supabase
        .from('note_collaborators')
        .select('*')
        .eq('note_id', noteId);
      
      if (error != null) throw new Error(error.message);
      return data;
    },

    async removeCollaborator(noteId: number, userId: string) {
      const { error } = await supabase
        .from('note_collaborators')
        .delete()
        .eq('note_id', noteId)
        .eq('user_id', userId);
      
      if (error != null) throw new Error(error.message);
      return true;
    },    async updateCollaboratorPermission(noteId: number, userId: string, permission: 'read' | 'write') {
      const { data, error } = await supabase
        .from('note_collaborators')
        .update({ permission })
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error != null) throw new Error(error.message);
      return data;
    },    async canEditNote(userId: string, noteId: number) {
      // ノートの所有者かどうかチェック
      const { data: note } = await supabase
        .from('notes')
        .select('user_id')
        .eq('id', noteId)
        .single();
      
      if (note?.user_id === userId) return true;
      
      // 共同編集者かどうかチェック（UUIDベース）
      const { data: collaborator } = await supabase
        .from('note_collaborators')
        .select('permission')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .single();
      
      if (collaborator?.permission === 'write') return true;
      
      // メールアドレスベースの共同編集者もチェック
      const { data: user } = await supabase.auth.getUser();
      if (user?.user?.email) {
        const { data: emailCollaborator } = await supabase
          .from('note_collaborators')
          .select('permission')
          .eq('note_id', noteId)
          .eq('user_id', user.user.email)
          .single();
        
        if (emailCollaborator?.permission === 'write') return true;
      }
      
      return false;
    },// リアルタイム編集セッション管理
    async createEditSession(noteId: number, userId: string) {
      const { data, error } = await (supabase as any)
        .from('note_edit_sessions')
        .insert({
          note_id: noteId,
          user_id: userId
        })
        .select()
        .single();
      
      if (error != null) throw new Error(error.message);
      return data;
    },

    async updateEditSession(sessionId: string, cursorPosition: number, selectionStart?: number, selectionEnd?: number) {
      const { data, error } = await (supabase as any)
        .from('note_edit_sessions')
        .update({
          cursor_position: cursorPosition,
          selection_start: selectionStart ?? cursorPosition,
          selection_end: selectionEnd ?? cursorPosition,
          last_active: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error != null) throw new Error(error.message);
      return data;
    },

    async getActiveEditSessions(noteId: number) {
      const { data, error } = await (supabase as any)
        .from('note_edit_sessions')
        .select('*')
        .eq('note_id', noteId)
        .gte('last_active', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // 10分以内
      
      if (error != null) throw new Error(error.message);
      return data;
    },

    async deleteEditSession(sessionId: string) {
      const { error } = await (supabase as any)
        .from('note_edit_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error != null) throw new Error(error.message);
      return true;
    },    // 共同編集者用のノート取得
    async findOneForCollaborator(noteId: number, userId: string) {
      // まずノートが存在するかチェック
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select()
        .eq('id', noteId)
        .single();
      
      if (noteError || !note) return null;
        // 共同編集者としてアクセス権限があるかチェック（UUIDベース）
      const { data: collaborator } = await supabase
        .from('note_collaborators')
        .select('permission')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .single();
      
      if (collaborator) return note;
      
      // メールアドレスベースの共同編集者もチェック
      const { data: user } = await supabase.auth.getUser();
      if (user?.user?.email) {
        const { data: emailCollaborator } = await supabase
          .from('note_collaborators')
          .select('permission')
          .eq('note_id', noteId)
          .eq('user_id', user.user.email)
          .single();
        
        if (emailCollaborator) return note;
      }
      
      return null;
    },
};