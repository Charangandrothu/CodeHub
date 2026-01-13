import { cn } from '../../lib/utils'; // adjusted path based on file location

export const Button = ({
    children,
    variant = 'primary',
    className,
    icon: Icon,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer";

    const variants = {
        primary: "bg-white text-black hover:bg-gray-100 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]",
        secondary: "bg-transparent text-white border border-white/20 hover:bg-white/5 hover:border-white/40",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
            {Icon && <Icon className="ml-2 h-4 w-4" />}
        </button>
    );
};
