declare namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_BACKEND_URL: string;
        // Agrega aquí cualquier otra variable de entorno que uses en el frontend con el prefijo NEXT_PUBLIC_
        // NEXT_PUBLIC_ANOTHER_VAR: string;
    }
}