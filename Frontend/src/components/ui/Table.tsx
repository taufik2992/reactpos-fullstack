import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
            {children}
          </table>
        </div>
      </div>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={`bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => {
  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}>
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', header = false }) => {
  const baseClasses = "px-3 sm:px-6 py-3 sm:py-4 text-left";
  const headerClasses = "text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider";
  const cellClasses = "text-sm text-gray-900 dark:text-white";
  
  if (header) {
    return (
      <th className={`${baseClasses} ${headerClasses} ${className}`}>
        {children}
      </th>
    );
  }
  
  return (
    <td className={`${baseClasses} ${cellClasses} ${className}`}>
      {children}
    </td>
  );
};