/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PUBLIC_WEBSITE_URL?: string;
	/** Gốc server (vd http://localhost:4000); REST nằm dưới /api trên Nest. Để trống → `/api` + proxy Vite. */
	readonly VITE_API_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
