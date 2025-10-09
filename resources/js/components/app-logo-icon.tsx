// AppLogoIcon.tsx
import { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/apple-touch-icon.png"
            alt="Mini Market Gustitos"
            className="h-auto w-auto max-w-[300px] filter-invert"
            {...props}
        />
    );
}