'use client';

import React, { useState } from 'react';
import { formatDate, formatCurrency } from '@/utils/referralUtils';
import { useReferralStore } from '@/stores/referralStore';

/**
 * ReferralSalesTable Component
 * Displays paginated list of sales attributed to affiliate
 */
export default function ReferralSalesTable({ sales = [], isLoading = false, pagination = {} }) {
  const { salesPagination, setSalesPage, setSalesLimit, sorting, toggleSalesSort } = useReferralStore();

  const handleSort = (field) => {
    toggleSalesSort(field);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-96 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attributed sales...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-64 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No attributed sales found</p>
            <p className="text-gray-400 text-sm mt-2">
              Sales from your referrals will appear here once customers make purchases
            </p>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    { field: 'createdAt', label: 'Date', sortable: true, width: '15%' },
    { field: 'orderId', label: 'Order ID', sortable: false, width: '20%' },
    { field: 'orderTotal', label: 'Order Total', sortable: true, width: '15%' },
    { field: 'commissionAmount', label: 'Commission', sortable: true, width: '15%' },
    { field: 'commissionRate', label: 'Rate', sortable: true, width: '12%' },
    { field: 'status', label: 'Status', sortable: false, width: '12%' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.field}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => col.sortable && handleSort(col.field)}
                  width={col.width}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && (
                      <span className="text-xs">
                        {sorting.salesSort.field === col.field &&
                          (sorting.salesSort.direction === 'asc' ? '↑' : '↓')}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale._id}
                className="border-b border-gray-200 hover:bg-blue-50 transition"
              >
                <td className="px-6 py-4 text-sm">{formatDate(sale.createdAt)}</td>
                <td className="px-6 py-4 text-sm font-mono">
                  {sale.orderId?.toString().substring(0, 12)}...
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {sale.orderId?.total ? formatCurrency(sale.orderId.total) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">
                  {formatCurrency(sale.commissionAmount || 0)}
                </td>
                <td className="px-6 py-4 text-sm">
                  {sale.orderId?.total && sale.commissionAmount
                    ? ((sale.commissionAmount / sale.orderId.total) * 100).toFixed(1) + '%'
                    : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Paid
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
          {pagination.totalItems} sales
        </div>

        <div className="flex items-center gap-4">
          {/* Items per page */}
          <select
            value={salesPagination.limit}
            onChange={(e) => setSalesLimit(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          {/* Pagination buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSalesPage(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              ← Previous
            </button>

            <span className="px-3 py-2 text-sm font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setSalesPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
