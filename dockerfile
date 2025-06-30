# --- ビルドステージ ---
# Node.jsの公式イメージを使用 (TypeScriptのコンパイルとnpm/yarnの実行のため)
FROM node:20.11.1-alpine AS build

# 作業ディレクトリを設定
WORKDIR /app

# ====================================================================
# ★★★ ここに移動します ★★★
# ビルドステージの冒頭に追加 (ARG はFROMの直後でもOK)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# ビルドコマンドの前に環境変数を設定（Viteの場合、`VITE_` プレフィックスが必要）
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
# ====================================================================

# デバック
RUN echo "DEBUG: VITE_SUPABASE_URL is -> ${VITE_SUPABASE_URL}"
RUN echo "DEBUG: VITE_SUPABASE_ANON_KEY is -> ${VITE_SUPABASE_ANON_KEY}"

# package.jsonとpackage-lock.json (または yarn.lock) をコピーして、
# 依存関係のインストールをキャッシュを活用できるようにする
COPY package*.json ./

# 依存関係をインストール
RUN npm install
# --frozen-lockfile

# プロジェクトのソースコードを全てコピー
COPY . .


# Reactアプリケーションをビルド
# ここで `npm run build` が実行される際には、
# 上で設定された VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY が利用可能です。
RUN npm run build

# --- 実行ステージ ---
# 軽くて安全なNginxイメージを使用 (ビルドされた静的ファイルを配信するため)
FROM nginx:alpine

# Nginxのデフォルト設定ファイルを削除
RUN rm /etc/nginx/conf.d/default.conf

# カスタムのNginx設定ファイルをコピー
# プロジェクトのルートに `nginx.conf` を作成してください
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルドステージで生成された静的ファイルをNginxの公開ディレクトリにコピー
COPY --from=build /app/dist /usr/share/nginx/html

# アプリケーションがリッスンするポートを公開 (Reactアプリのデフォルトは通常3000だが、Nginxは80)
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]