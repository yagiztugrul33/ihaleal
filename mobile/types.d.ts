/// <reference types="expo/types" />

declare module '*.module.css' {
  const styles: { readonly [key: string]: string };
  export default styles;
}

declare module '*.css';
