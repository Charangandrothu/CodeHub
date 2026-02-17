import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Button = ({
  children,
  variant = 'primary',
  className,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-app-primary/60 focus:ring-offset-2 focus:ring-offset-app-bg disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_14px_30px_-18px_rgba(59,130,246,0.9)] hover:shadow-[0_20px_32px_-16px_rgba(59,130,246,0.85)] hover:-translate-y-0.5',
    secondary: 'border border-app-border bg-app-panel text-app-text hover:border-blue-400/50 hover:bg-app-primary-soft',
    ghost: 'text-app-muted hover:bg-app-primary-soft hover:text-app-text',
  };

  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
      {Icon && <Icon className="h-4 w-4" />}
    </motion.button>
  );
};
