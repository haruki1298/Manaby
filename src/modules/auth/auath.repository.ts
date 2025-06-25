import { supabase } from "@/lib/supabase"

export const authRepository = {
    async signup(name: string, email: string, password: string){
        const { data, error } =await supabase.auth.signUp({
            email,
            password,
            options:{ data : { name } },
        });
        if(error != null || data.user == null) throw new Error(error?.message);
        
        return{
            ...data.user,
            userName: data.user.user_metadata.name,
        }
    },
    async signin(email: string, password: string){
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error != null || data.user == null) throw new Error(error?.message);
        return {
            ...data.user,
            userName: data.user.user_metadata.name,
        }
    },

    async getCurrentUser() {
        const { data, error } = await supabase.auth.getSession();
        if (error != null) throw new Error(error.message);
        if (data.session == null) return;
        return {
          ...data.session.user,
          userName: data.session.user.user_metadata.name,
        };
      },

      async signout() {
        const { error } = await supabase.auth.signOut();
        if (error != null) throw new Error(error.message);
        return true;
      },

      async updateUserDisplayName(displayName: string) {
        console.log('Updating user display name to:', displayName);
        
        // セッションの確認
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError != null) {
          console.error('Session error:', sessionError);
          throw new Error('SESSION_ERROR');
        }
        if (sessionData.session == null) {
          console.error('No active session');
          throw new Error('NO_SESSION');
        }
        
        const { data, error } = await supabase.auth.updateUser({
          data: { name: displayName }
        });
        if (error != null) {
          console.error('Error updating user display name:', error);
          if (error.message.includes('Auth session missing') || error.message.includes('JWT expired')) {
            throw new Error('SESSION_EXPIRED');
          }
          throw new Error(error.message);
        }
        console.log('User updated successfully:', data.user);
        return {
          ...data.user,
          userName: data.user?.user_metadata.name,
        };
      },

      async refreshSession() {
        console.log('Refreshing session...');
        const { data, error } = await supabase.auth.refreshSession();
        if (error != null) {
          console.error('Error refreshing session:', error);
          throw new Error('REFRESH_FAILED');
        }
        console.log('Session refreshed successfully');
        return data.session;
      },
};