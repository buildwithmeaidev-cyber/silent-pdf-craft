import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = () => setIsDark(!isDark);

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors',
        isDark ? 'bg-foreground/10' : 'bg-background/10'
      )}
      aria-label='Toggle dark mode'
    >
      {isDark ? <Sun className='size-5 text-primary-foreground' /> : <Moon className='size-5 text-muted-foreground' />}
    </button>
  );
}
