// This file is used to fix the React import issue
declare module 'react' {
  export = React;
  export as namespace React;
} 