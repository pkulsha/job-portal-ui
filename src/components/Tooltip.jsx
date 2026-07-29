const Tooltip = ({ children, content, position = 'top', className = '' }) => {
  const bubblePositionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowPositionClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent',
  };

  return (
    <span className={`group/tooltip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 w-max max-w-xs rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-lg opacity-0 scale-95 transition-all duration-300 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100 ${bubblePositionClasses[position]}`}
      >
        {content}
        <span
          className={`absolute h-0 w-0 border-4 ${arrowPositionClasses[position]}`}
          aria-hidden="true"
        />
      </span>
    </span>
  );
};

export default Tooltip;
