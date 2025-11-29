declare module 'next/server.js' {
    import type { NextRequest as NR, NextResponse as NRe } from 'next/server';
    export type NextRequest = NR;
    export type NextResponse = NRe;
    export * from 'next/server';
}

declare module 'next/types.js' {
    export * from 'next/types';
}
