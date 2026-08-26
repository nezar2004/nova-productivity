import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
const geist=Geist({variable:'--font-geist',subsets:['latin']}); const mono=Geist_Mono({variable:'--font-mono',subsets:['latin']});
const title='DEV UI — Future System Interface';
const description='Interactive futuristic operating-system interface with terminal, virtual keyboard, system modules, and live HUD.';
export const metadata:Metadata={metadataBase:new URL(process.env.SITE_ORIGIN??'http://localhost:3000'),title,description,openGraph:{title,description,images:[{url:'/og.png',width:1200,height:630,alt:'DEV UI — Future System Interface'}]},twitter:{card:'summary_large_image',title,description,images:['/og.png']}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" dir="ltr"><body className={`${geist.variable} ${mono.variable}`}>{children}</body></html>}

