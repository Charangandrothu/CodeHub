import React, { useRef, useState, useEffect } from "react";

const FractionalPicker = ({ min = 30, max = 365, value, onChange, disabled, className }) => {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const startScrollLeft = useRef(0);
    const itemWidth = 10; // Pixel width for each tick/step
    const step = 1; // Step value

    // Generate ticks based on min, max, and step
    const ticks = [];
    for (let i = min; i <= max; i += step) {
        ticks.push(i);
    }

    // Handle scrolling to the initial value
    useEffect(() => {
        if (containerRef.current) {
            const index = (value - min) / step;
            const centerOffset = containerRef.current.clientWidth / 2;
            containerRef.current.scrollLeft = index * itemWidth - centerOffset + itemWidth / 2;
        }
    }, []);

    // Sync scroll position with value if value changes externally (and not dragging)
    useEffect(() => {
        if (!isDragging && containerRef.current) {
            const index = (value - min) / step;
            const centerOffset = containerRef.current.clientWidth / 2;
            // Check if significantly off to avoid jitter
            const targetScroll = index * itemWidth - centerOffset + itemWidth / 2;
            if (Math.abs(containerRef.current.scrollLeft - targetScroll) > itemWidth) {
                containerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
            }
        }
    }, [value, min, step, isDragging]);


    const handleScroll = () => {
        if (containerRef.current) {
            const scrollLeft = containerRef.current.scrollLeft;
            const centerOffset = containerRef.current.clientWidth / 2;
            const rawIndex = (scrollLeft + centerOffset) / itemWidth;
            const index = Math.max(0, Math.min(ticks.length - 1, Math.round(rawIndex)));
            const newValue = ticks[index];

            if (newValue !== value) {
                onChange(newValue);
            }
        }
    };


    const handleMouseDown = (e) => {
        if (disabled) return;
        setIsDragging(true);
        startX.current = e.pageX - containerRef.current.offsetLeft;
        startScrollLeft.current = containerRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        // Snap to nearest tick on release
        if (containerRef.current) {
            const scrollLeft = containerRef.current.scrollLeft;
            const centerOffset = containerRef.current.clientWidth / 2;
            const rawIndex = (scrollLeft + centerOffset) / itemWidth;
            const index = Math.max(0, Math.min(ticks.length - 1, Math.round(rawIndex)));

            const targetScroll = index * itemWidth - centerOffset + itemWidth / 2;
            containerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || disabled) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Scroll-fast
        containerRef.current.scrollLeft = startScrollLeft.current - walk;
    };

    return (
        <div className={`relative w-full h-16 overflow-hidden select-none border border-white/10 rounded-xl ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className || 'bg-[#0A0A0A]'}`}>
            {/* Center Indicator */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-blue-500 z-10 -translate-x-1/2 pointer-events-none shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>

            {/* Dynamic Value Display (Overlay) */}
            <div className="absolute top-1 left-2 z-20 pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target</span>
            </div>
            <div className="absolute top-1 right-2 z-20 pointer-events-none">
                <span className="text-xs font-mono font-bold text-white bg-black/40 px-1.5 rounded">{value} Days</span>
            </div>


            {/* Scrollable Container */}
            <div
                ref={containerRef}
                className="flex items-end h-full overflow-x-scroll no-scrollbar cursor-grab active:cursor-grabbing px-[50%]"
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
            >
                <div className="flex items-end gap-0 h-full pb-0 relative">
                    {ticks.map((tick, i) => {
                        const isMajor = tick % 30 === 0;
                        const isMedium = tick % 10 === 0 && !isMajor;

                        return (
                            <div
                                key={tick}
                                className="flex flex-col items-center justify-end flex-shrink-0"
                                style={{ width: `${itemWidth}px` }}
                            >
                                {/* Tick Line */}
                                <div
                                    className={`w-[1px] rounded-full transition-colors ${isMajor
                                        ? "h-8 bg-zinc-400"
                                        : isMedium
                                            ? "h-5 bg-zinc-600"
                                            : "h-3 bg-zinc-800"
                                        }`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Overlay Gradients for smooth fade out */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0A0A0A] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none" />
        </div>
    );
};

export default FractionalPicker;
