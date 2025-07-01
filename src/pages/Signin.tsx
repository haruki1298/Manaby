import { authRepository } from '@/modules/auth/auath.repository';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const currentUserStore = useCurrentUserStore();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("メールアドレスを入力してください");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("有効なメールアドレスを入力してください");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("パスワードを入力してください");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("パスワードは6文字以上で入力してください");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    try {
      const user = await authRepository.signin(email, password);
      currentUserStore.set(user);
    } catch (error) {
      setEmailError("メールアドレスまたはパスワードが正しくありません");
    }
  };

  if(currentUserStore.currentUser != null) return <Navigate replace to="/" />

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <h2
  className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg animate-logo-fade"
  style={{ fontFamily: "'Lobster', cursive" }}
>
  Manaby
</h2>

        <div className="mt-8 w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  メールアドレス
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    id="email"
                    name="email"
                    placeholder="メールアドレス"
                    required
                    type="email"
                    className={`input-white-bg appearance-none block w-full px-3 py-2 border ${
                      emailError ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring--500 focus:border--500 sm:text-sm`}
                  />
                  {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  パスワード
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    id="password"
                    name="password"
                    placeholder="パスワード"
                    required
                    type="password"
                    className={`input-white-bg appearance-none block w-full px-3 py-2 border ${
                      passwordError ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring--500 focus:border--500 sm:text-sm`}
                  />
                  {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                </div>
              </div>
              <div>
                <button 
                disabled={email === '' || password === ''}
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring--500 disabled:opacity-50 disabled:cursor-not-allowed">
                  ログイン
                </button>
              </div>
              <div className="mt-4 text-center text-sm">
                登録は
                <Link className="underline" to={'/signup'}>
                  こちら
                </Link>
                から
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
