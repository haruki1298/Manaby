import { ChevronsLeftRight, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@supabase/supabase-js';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  user: User;
  signout: () => void;
};

const UserItem: FC<Props> = ({ user, signout }) => {
  const { t } = useTranslation();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="flex items-center text-sm p-3 w-full hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-150 group"
          role="button"
        >
          <div className="flex items-center gap-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user.user_metadata.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900 dark:text-white truncate">
                {user.user_metadata.name}{t('user.nameSuffix')}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-300 truncate">
                {t('user.workspace')}
              </p>
            </div>
          </div>
          <ChevronsLeftRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-white transition-colors duration-150 flex-shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 shadow-lg border border-neutral-200 dark:border-neutral-700"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.user_metadata.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {user.user_metadata.name}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 m-1"
          onClick={signout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>{t('sidebar.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserItem;
