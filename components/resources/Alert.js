const Alert = ({ children, variant = 'default' }) => {
    const bgColor = variant === 'destructive'
        ? 'bg-red-50 dark:bg-red-900/50'
        : 'bg-blue-50 dark:bg-blue-900/50';
    const textColor = variant === 'destructive'
        ? 'text-red-700 dark:text-red-200'
        : 'text-blue-700 dark:text-blue-200';
    const borderColor = variant === 'destructive'
        ? 'border-red-400 dark:border-red-800'
        : 'border-blue-400 dark:border-blue-800';

    return (
        <div className={`${bgColor} ${textColor} p-4 rounded-lg border ${borderColor}`} role="alert">
            {children}
        </div>
    );
};

export default Alert;