/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BOOKINGS_URL: string;
  readonly VITE_INVENTORY_URL: string;
  readonly VITE_LOCATIONS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
