/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAL_CLIENT_ID: string
  readonly VITE_MAL_CLIENT_SECRET: string
  readonly VITE_ANILIST_CLIENT_ID: string
  readonly VITE_ANILIST_CLIENT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}