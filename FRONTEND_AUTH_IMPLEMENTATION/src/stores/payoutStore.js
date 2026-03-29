/**
 * Payout Store - Zustand State Management
 * 
 * Manages:
 * - Filter state (status, method, date range, etc.)
 * - Pagination state
 * - Modal states (approval, processing, rejection)
 * - Batch selection/operations
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Create payout store
 */
const usePayoutStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ==================== FILTER STATE ====================
        
        /**
         * Affiliate filters
         */
        affiliateFilters: {
          page: 1,
          limit: 20,
          status: '', // empty = all statuses
          dateFrom: '',
          dateTo: ''
        },

        setAffiliateFilters: (filters) =>
          set((state) => ({
            affiliateFilters: { ...state.affiliateFilters, ...filters }
          })),

        resetAffiliateFilters: () =>
          set({
            affiliateFilters: {
              page: 1,
              limit: 20,
              status: '',
              dateFrom: '',
              dateTo: ''
            }
          }),

        /**
         * Admin filters
         */
        adminFilters: {
          page: 1,
          limit: 20,
          status: '',
          affId: '', // affiliate ID
          method: '' // payment method
        },

        setAdminFilters: (filters) =>
          set((state) => ({
            adminFilters: { ...state.adminFilters, ...filters }
          })),

        resetAdminFilters: () =>
          set({
            adminFilters: {
              page: 1,
              limit: 20,
              status: '',
              affId: '',
              method: ''
            }
          }),

        // ==================== MODAL STATE ====================

        /**
         * Approval modal (admin approving payouts)
         */
        modals: {
          approvalModal: {
            isOpen: false,
            payoutId: null,
            notes: ''
          },
          processingModal: {
            isOpen: false,
            payoutId: null,
            receiptId: '',
            transactionId: ''
          },
          rejectionModal: {
            isOpen: false,
            payoutId: null,
            reason: '',
            details: ''
          },
          detailsModal: {
            isOpen: false,
            payoutId: null
          }
        },

        // Approval modal actions
        openApprovalModal: (payoutId) =>
          set((state) => ({
            modals: {
              ...state.modals,
              approvalModal: {
                isOpen: true,
                payoutId,
                notes: ''
              }
            }
          })),

        closeApprovalModal: () =>
          set((state) => ({
            modals: {
              ...state.modals,
              approvalModal: {
                isOpen: false,
                payoutId: null,
                notes: ''
              }
            }
          })),

        updateApprovalNotes: (notes) =>
          set((state) => ({
            modals: {
              ...state.modals,
              approvalModal: {
                ...state.modals.approvalModal,
                notes
              }
            }
          })),

        // Processing modal actions
        openProcessingModal: (payoutId) =>
          set((state) => ({
            modals: {
              ...state.modals,
              processingModal: {
                isOpen: true,
                payoutId,
                receiptId: '',
                transactionId: ''
              }
            }
          })),

        closeProcessingModal: () =>
          set((state) => ({
            modals: {
              ...state.modals,
              processingModal: {
                isOpen: false,
                payoutId: null,
                receiptId: '',
                transactionId: ''
              }
            }
          })),

        updateProcessingDetails: (receiptId, transactionId) =>
          set((state) => ({
            modals: {
              ...state.modals,
              processingModal: {
                ...state.modals.processingModal,
                receiptId,
                transactionId
              }
            }
          })),

        // Rejection modal actions
        openRejectionModal: (payoutId) =>
          set((state) => ({
            modals: {
              ...state.modals,
              rejectionModal: {
                isOpen: true,
                payoutId,
                reason: '',
                details: ''
              }
            }
          })),

        closeRejectionModal: () =>
          set((state) => ({
            modals: {
              ...state.modals,
              rejectionModal: {
                isOpen: false,
                payoutId: null,
                reason: '',
                details: ''
              }
            }
          })),

        updateRejectionDetails: (reason, details) =>
          set((state) => ({
            modals: {
              ...state.modals,
              rejectionModal: {
                ...state.modals.rejectionModal,
                reason,
                details
              }
            }
          })),

        // Details modal actions
        openDetailsModal: (payoutId) =>
          set((state) => ({
            modals: {
              ...state.modals,
              detailsModal: {
                isOpen: true,
                payoutId
              }
            }
          })),

        closeDetailsModal: () =>
          set((state) => ({
            modals: {
              ...state.modals,
              detailsModal: {
                isOpen: false,
                payoutId: null
              }
            }
          })),

        // ==================== BATCH OPERATIONS ====================

        /**
         * Batch selection state
         */
        batchSelection: {
          selected: [], // Array of selected payout IDs
          selectAll: false,
          totalCount: 0
        },

        toggleBatchSelection: (payoutId) =>
          set((state) => {
            const isSelected = state.batchSelection.selected.includes(payoutId);
            return {
              batchSelection: {
                ...state.batchSelection,
                selected: isSelected
                  ? state.batchSelection.selected.filter((id) => id !== payoutId)
                  : [...state.batchSelection.selected, payoutId],
                selectAll: false
              }
            };
          }),

        setBatchSelection: (payoutIds) =>
          set({
            batchSelection: {
              selected: payoutIds,
              selectAll: false,
              totalCount: payoutIds.length
            }
          }),

        toggleSelectAll: (payoutIds = []) =>
          set((state) => {
            const newSelectAll = !state.batchSelection.selectAll;
            return {
              batchSelection: {
                selected: newSelectAll ? payoutIds : [],
                selectAll: newSelectAll,
                totalCount: newSelectAll ? payoutIds.length : 0
              }
            };
          }),

        clearBatchSelection: () =>
          set({
            batchSelection: {
              selected: [],
              selectAll: false,
              totalCount: 0
            }
          }),

        /**
         * Batch operation state
         */
        batchOperation: {
          isProcessing: false,
          progress: 0,
          successCount: 0,
          failureCount: 0,
          errors: []
        },

        startBatchOperation: () =>
          set({
            batchOperation: {
              isProcessing: true,
              progress: 0,
              successCount: 0,
              failureCount: 0,
              errors: []
            }
          }),

        updateBatchOperationProgress: (progress, successCount, failureCount, errors) =>
          set({
            batchOperation: {
              isProcessing: true,
              progress,
              successCount,
              failureCount,
              errors
            }
          }),

        completeBatchOperation: () =>
          set({
            batchOperation: {
              isProcessing: false,
              progress: 100,
              successCount: 0,
              failureCount: 0,
              errors: []
            }
          }),

        resetBatchOperation: () =>
          set({
            batchOperation: {
              isProcessing: false,
              progress: 0,
              successCount: 0,
              failureCount: 0,
              errors: []
            }
          })
      }),
      {
        name: 'payout-store', // localStorage key
        partialize: (state) => ({
          affiliateFilters: state.affiliateFilters,
          adminFilters: state.adminFilters
        }) // Only persist filters
      }
    )
  )
);

/**
 * Selector hook for affiliate filters
 */
export const useAffiliateFilters = () =>
  usePayoutStore((state) => state.affiliateFilters);

/**
 * Selector hook for admin filters
 */
export const useAdminFilters = () =>
  usePayoutStore((state) => state.adminFilters);

/**
 * Selector hook for modals
 */
export const usePayoutModals = () =>
  usePayoutStore((state) => state.modals);

/**
 * Selector hook for batch selection
 */
export const useBatchSelection = () =>
  usePayoutStore((state) => state.batchSelection);

/**
 * Selector hook for batch operation
 */
export const useBatchOperation = () =>
  usePayoutStore((state) => state.batchOperation);

export default usePayoutStore;
