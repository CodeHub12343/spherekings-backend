/**
 * Commission Store (Zustand)
 * Global state management for commission-related state
 * 
 * Manages:
 * - Commission filters and pagination
 * - UI state (modals, selections, etc.)
 * - Batch operation state
 * - Temporary commission data
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Commission Store
 * Provides centralized state for commission operations
 */
const useCommissionStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ==================== AFFILIATE STATE ====================

        // Affiliate commission list filters
        affiliateFilters: {
          page: 1,
          limit: 20,
          status: null, // pending, approved, paid, reversed
          dateFrom: null,
          dateTo: null,
        },

        // Selected commission for detail view
        selectedCommissionId: null,
        detailCommissionData: null,

        // ==================== ADMIN STATE ====================

        // Admin commission list filters
        adminFilters: {
          page: 1,
          limit: 20,
          status: null,
          fraudOnly: false,
          dateFrom: null,
          dateTo: null,
        },

        // Batch operations
        batchSelection: {
          selected: [], // Array of commission IDs
          mode: null, // 'approve', 'pay', 'reverse', null
          selectAll: false,
        },

        // Modal states
        modals: {
          approvalModal: {
            isOpen: false,
            commissionId: null,
            notes: '',
          },
          paymentModal: {
            isOpen: false,
            commissionId: null,
            method: 'stripe',
            transactionId: '',
            receiptId: '',
          },
          reversalModal: {
            isOpen: false,
            commissionId: null,
            reason: '',
            details: '',
            amount: null,
          },
          batchProcessingModal: {
            isOpen: false,
            mode: null, // 'approve', 'pay'
            processing: false,
          },
        },

        // ==================== AFFILIATE FILTERS ACTIONS ====================

        setAffiliateFilters: (filters) =>
          set(
            (state) => ({
              affiliateFilters: {
                ...state.affiliateFilters,
                ...filters,
              },
            }),
            false,
            'setAffiliateFilters'
          ),

        resetAffiliateFilters: () =>
          set(
            () => ({
              affiliateFilters: {
                page: 1,
                limit: 20,
                status: null,
                dateFrom: null,
                dateTo: null,
              },
            }),
            false,
            'resetAffiliateFilters'
          ),

        // ==================== ADMIN FILTERS ACTIONS ====================

        setAdminFilters: (filters) =>
          set(
            (state) => ({
              adminFilters: {
                ...state.adminFilters,
                ...filters,
              },
            }),
            false,
            'setAdminFilters'
          ),

        resetAdminFilters: () =>
          set(
            () => ({
              adminFilters: {
                page: 1,
                limit: 20,
                status: null,
                fraudOnly: false,
                dateFrom: null,
                dateTo: null,
              },
            }),
            false,
            'resetAdminFilters'
          ),

        // ==================== COMMISSION SELECTION ACTIONS ====================

        setSelectedCommissionId: (commissionId) =>
          set(
            {
              selectedCommissionId: commissionId,
            },
            false,
            'setSelectedCommissionId'
          ),

        setDetailCommissionData: (commission) =>
          set(
            {
              detailCommissionData: commission,
            },
            false,
            'setDetailCommissionData'
          ),

        clearSelectedCommission: () =>
          set(
            {
              selectedCommissionId: null,
              detailCommissionData: null,
            },
            false,
            'clearSelectedCommission'
          ),

        // ==================== BATCH SELECTION ACTIONS ====================

        toggleBatchSelection: (commissionId) =>
          set(
            (state) => {
              const isSelected = state.batchSelection.selected.includes(commissionId);
              return {
                batchSelection: {
                  ...state.batchSelection,
                  selected: isSelected
                    ? state.batchSelection.selected.filter((id) => id !== commissionId)
                    : [...state.batchSelection.selected, commissionId],
                  selectAll: false,
                },
              };
            },
            false,
            'toggleBatchSelection'
          ),

        setBatchMode: (mode) =>
          set(
            (state) => ({
              batchSelection: {
                ...state.batchSelection,
                mode,
              },
            }),
            false,
            'setBatchMode'
          ),

        clearBatchSelection: () =>
          set(
            {
              batchSelection: {
                selected: [],
                mode: null,
                selectAll: false,
              },
            },
            false,
            'clearBatchSelection'
          ),

        // ==================== MODAL ACTIONS ====================

        openApprovalModal: (commissionId) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                approvalModal: {
                  isOpen: true,
                  commissionId,
                  notes: '',
                },
              },
            }),
            false,
            'openApprovalModal'
          ),

        closeApprovalModal: () =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                approvalModal: {
                  isOpen: false,
                  commissionId: null,
                  notes: '',
                },
              },
            }),
            false,
            'closeApprovalModal'
          ),

        updateApprovalModal: (updates) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                approvalModal: {
                  ...state.modals.approvalModal,
                  ...updates,
                },
              },
            }),
            false,
            'updateApprovalModal'
          ),

        openPaymentModal: (commissionId) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                paymentModal: {
                  isOpen: true,
                  commissionId,
                  method: 'stripe',
                  transactionId: '',
                  receiptId: '',
                },
              },
            }),
            false,
            'openPaymentModal'
          ),

        closePaymentModal: () =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                paymentModal: {
                  isOpen: false,
                  commissionId: null,
                  method: 'stripe',
                  transactionId: '',
                  receiptId: '',
                },
              },
            }),
            false,
            'closePaymentModal'
          ),

        updatePaymentModal: (updates) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                paymentModal: {
                  ...state.modals.paymentModal,
                  ...updates,
                },
              },
            }),
            false,
            'updatePaymentModal'
          ),

        openReversalModal: (commissionId) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                reversalModal: {
                  isOpen: true,
                  commissionId,
                  reason: '',
                  details: '',
                  amount: null,
                },
              },
            }),
            false,
            'openReversalModal'
          ),

        closeReversalModal: () =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                reversalModal: {
                  isOpen: false,
                  commissionId: null,
                  reason: '',
                  details: '',
                  amount: null,
                },
              },
            }),
            false,
            'closeReversalModal'
          ),

        updateReversalModal: (updates) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                reversalModal: {
                  ...state.modals.reversalModal,
                  ...updates,
                },
              },
            }),
            false,
            'updateReversalModal'
          ),

        openBatchProcessingModal: (mode) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                batchProcessingModal: {
                  isOpen: true,
                  mode,
                  processing: false,
                },
              },
            }),
            false,
            'openBatchProcessingModal'
          ),

        closeBatchProcessingModal: () =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                batchProcessingModal: {
                  isOpen: false,
                  mode: null,
                  processing: false,
                },
              },
            }),
            false,
            'closeBatchProcessingModal'
          ),

        setBatchProcessing: (processing) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                batchProcessingModal: {
                  ...state.modals.batchProcessingModal,
                  processing,
                },
              },
            }),
            false,
            'setBatchProcessing'
          ),
      }),
      {
        name: 'commission-store',
        version: 1,
        // Persist only specific parts of state
        partialize: (state) => ({
          affiliateFilters: state.affiliateFilters,
          adminFilters: state.adminFilters,
        }),
      }
    )
  )
);

export default useCommissionStore;

/**
 * Selector hooks for common state selections
 * Helps avoid unnecessary re-renders by selecting specific slices
 */

export const useAffiliateFilters = () =>
  useCommissionStore((state) => state.affiliateFilters);

export const useAdminFilters = () =>
  useCommissionStore((state) => state.adminFilters);

export const useSelectedCommission = () =>
  useCommissionStore((state) => ({
    id: state.selectedCommissionId,
    data: state.detailCommissionData,
  }));

export const useBatchSelection = () =>
  useCommissionStore((state) => state.batchSelection);

export const useApprovalModal = () =>
  useCommissionStore((state) => state.modals.approvalModal);

export const usePaymentModal = () =>
  useCommissionStore((state) => state.modals.paymentModal);

export const useReversalModal = () =>
  useCommissionStore((state) => state.modals.reversalModal);

export const useBatchProcessingModal = () =>
  useCommissionStore((state) => state.modals.batchProcessingModal);
