'use client';

import { ReactNode, useState } from 'react';

interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T extends Record<string, any>>({
    data,
    columns,
    keyField,
    isLoading = false,
    emptyMessage = 'No data available',
    onRowClick,
}: TableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 select-none' : ''
                                    }`}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className="flex items-center gap-2">
                                    {column.label}
                                    {column.sortable && sortKey === column.key && (
                                        <svg
                                            className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 15l7-7 7 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : sortedData.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((item) => (
                            <tr
                                key={String(item[keyField])}
                                className={`bg-white dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : String(item[column.key] ?? '-')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
