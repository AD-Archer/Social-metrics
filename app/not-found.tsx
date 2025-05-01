/**
 * @file app/not-found.tsx
 * @description Defines the global 404 Not Found page for the application.
 * This page is automatically rendered by Next.js when a requested route does not exist.
 * It utilizes the NoMessage component to display a humorous message and provides
 * a link for the user to navigate back to the dashboard.
 */
'use client';


import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Renders the 404 Not Found page.
 */
export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Oops! The page you are looking for does not exist.
                    </p>
                </div>
             <Link href="/dashboard" passHref className="mt-8">
                 <Button variant="outline">Return to Dashboard</Button>
             </Link>
        </div>
    );
}
