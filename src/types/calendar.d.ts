declare global {
  interface Window {
    gapi: any;
    google: any; // You can replace `any` with a more specific type if needed
  }
}

// This line is necessary for TypeScript to treat this file as a module
export {};
