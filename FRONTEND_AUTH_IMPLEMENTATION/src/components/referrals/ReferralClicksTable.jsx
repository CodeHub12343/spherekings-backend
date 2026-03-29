'use client';

import React, { useState } from 'react';
import {
  formatDate,
  getDeviceName,
  getSourceName,
  getConversionStatusLabel,
  getConversionStatusColor,
} from '@/utils/referralUtils';
import { useReferralStore } from '@/stores/referralStore';

/**
 * ReferralClicksTable Component
 * Displays paginated list of referral clicks
 */
export default function ReferralClicksTable({ referrals = [], isLoading = false, pagination = {} }) {
  const [selectedReferrals, setSelectedReferrals] = useState([]);
  
  const {
    clicksPagination,
    setClicksPage,
    setClicksLimit,
    sorting,
    toggleClicksSort,
    openReferralModal,
  } = useReferralStore();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReferrals(referrals.map((r) => r._id));
    } else {
      setSelectedReferrals([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedReferrals((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    toggleClicksSort(field);
  };

  const columns = [
    { field: 'createdAt', label: 'Date', format: 'date', sortable: true, width: '15%' },
    { field: 'referralSource', label: 'Source', format: 'source', sortable: true, width: '15%' },
    { field: 'device', label: 'Device', format: 'device', sortable: true, width: '12%' },
    {
      field: 'convertedToSale',
      label: 'Status',
      format: 'status',
      sortable: true,
      width: '15%',
    },
    { field: 'commissionAmount', label: 'Commission', format: 'currency', sortable: true, width: '15%' },
    { field: 'actions', label: 'Actions', format: 'actions', width: '15%' },
  ];

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-96 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading referral clicks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!referrals || referrals.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-64 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No referral clicks found</p>
            <p className="text-gray-400 text-sm mt-2">Clicks will appear here when affiliates start sharing your link</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left" width="5%">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedReferrals.length === referrals.length && referrals.length > 0}
                  className="rounded border-gray-300"
                />
              </th>
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
                        {sorting.clicksSort.field === col.field &&
                          (sorting.clicksSort.direction === 'asc' ? '↑' : '↓')}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referrals.map((referral) => (
              <tr
                key={referral._id}
                className="border-b border-gray-200 hover:bg-blue-50 transition"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedReferrals.includes(referral._id)}
                    onChange={() => handleSelect(referral._id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 text-sm">{formatDate(referral.createdAt)}</td>
                <td className="px-6 py-4 text-sm">{getSourceName(referral.referralSource)}</td>
                <td className="px-6 py-4 text-sm">{getDeviceName(referral.device)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getConversionStatusColor(
                      referral.convertedToSale
                    )}`}
                  >
                    {getConversionStatusLabel(referral.convertedToSale)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {referral.convertedToSale && referral.commissionAmount
                    ? `$${referral.commissionAmount.toFixed(2)}`
                    : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => openReferralModal(referral)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
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
          {pagination.totalItems} referrals
        </div>

        <div className="flex items-center gap-4">
          {/* Items per page */}
          <select
            value={clicksPagination.limit}
            onChange={(e) => setClicksLimit(parseInt(e.target.value))}
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
              onClick={() => setClicksPage(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              ← Previous
            </button>

            <span className="px-3 py-2 text-sm font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setClicksPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
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
