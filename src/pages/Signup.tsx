import { authRepository } from "@/modules/auth/auath.repository";
import { useCurrentUserStore } from "@/modules/auth/current-user.state";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const currentUserStore = useCurrentUserStore();
  const navigate = useNavigate();

  // (バリデーション関数は変更なし)
  const validateName = (name: string) => {
    if (!name) {
      setNameError("ユーザー名を入力してください");
      return false;
    }
    setNameError("");
    return true;
  };

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

  // ----- ここからが修正箇所 -----
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) return;

    try {
      // 1. signup処理からuserオブジェクトを受け取る
      const user = await authRepository.signup(name, email, password);

      // 2. 受け取ったuser情報をグローバルStateにセットする
      // (注意: Supabaseでメール認証を有効にしている場合、初回サインアップ直後のuser.sessionはnullの可能性があります。
      // その場合はuserオブジェクト自体は存在するので、ここではuserが存在するかどうかでチェックします。)
      if (user) {
        currentUserStore.set(user);
        
        // 3. Stateの更新が完了してからホーム画面へ遷移
        navigate('/');
      } else {
        // userが取得できなかった場合のフォールバック処理
        // (例: メール認証が必要な場合など)
        alert("登録処理が完了しましたが、ユーザー情報が取得できませんでした。メールを確認してください。");
        // この場合はログインページに飛ばすなどのハンドリングも考えられます
        // navigate('/signin');
      }

    } catch (error) {
      console.error('Signup error:', error);
      setEmailError('登録に失敗しました。このメールアドレスは既に使用されている可能性があります。');
    }
  };
  // ----- ここまでが修正箇所 -----

  if(currentUserStore.currentUser != null) return <Navigate replace to="/" />

  return (
    // JSXの部分は変更なし
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Manaby
        </h2>
        <div className="mt-8 w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="username"
                >
                  ユーザー名
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => {
                      setName(e.target.value);
                      validateName(e.target.value);
                    }}
                    id="username"
                    name="username"
                    placeholder="ユーザー名"
                    required
                    type="text"
                    className={`input-white-bg appearance-none block w-full px-3 py-2 border ${
                      nameError ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm`}
                  />
                  {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
                </div>
              </div>
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
                      validateEmail(e.target.value)
                    }}
                    id="email"
                    name="email"
                    placeholder="メールアドレス"
                    required
                    type="email"
                    className={`input-white-bg appearance-none block w-full px-3 py-2 border ${
                      emailError ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm`}
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
                    type="password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value)
                    }}
                    required
                    id="password"
                    name="password"
                    placeholder="パスワード"
                    className={`input-white-bg appearance-none block w-full px-3 py-2 border ${
                      passwordError ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm`}
                  />
                   {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                </div>
              </div>
              <div>
                <button 
                disabled={name === '' || email === '' || password === '' || !!nameError || !!emailError || !!passwordError}
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  登録
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;