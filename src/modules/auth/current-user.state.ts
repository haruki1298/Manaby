import { User } from "@supabase/supabase-js";
import { useAtom } from "jotai";
import { atom } from "jotai";

const currentUserAtom = atom<User>();

export const useCurrentUserStore = () => {
    const [currentUser, setCurrentUser] = useAtom(currentUserAtom)
    
    const updateUser = (updatedUser: User) => {
        setCurrentUser(updatedUser);
    };
    
    return {
        currentUser, 
        set: setCurrentUser,
        updateUser
    };
};