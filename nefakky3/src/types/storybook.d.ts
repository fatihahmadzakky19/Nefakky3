declare module '@storybook/react' {
  import React from 'react';

  export type Meta<T = any> = {
    title?: string;
    component?: any;
    tags?: string[];
    parameters?: Record<string, any>;
    decorators?: Array<(Story: any) => React.ReactElement>;
    [key: string]: any;
  };

  export type StoryObj<T = any> = {
    args?: Partial<T> | Record<string, any>;
    render?: (args: T) => React.ReactElement;
    play?: (context: any) => Promise<void> | void;
    [key: string]: any;
  };
}

declare module '@storybook/nextjs-vite' {
  export * from '@storybook/react';
}

declare module 'storybook/test' {
  export const fn: any;
  export const expect: any;
  export const userEvent: any;
  export const within: any;
}
