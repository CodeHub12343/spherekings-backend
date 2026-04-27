# Categories Page Fix - PUT/DELETE 500 Errors

## Problem
Categories page was returning 500 errors when attempting to edit or delete categories:
- `PUT /api/v1/categories/undefined` 500 error
- `DELETE /api/v1/categories/undefined` 500 error

## Root Cause
The `useUpdateCategory` and `useDeleteCategory` hooks were expecting `categoryId` as a parameter at hook creation time, but the component was calling them without any arguments:

```javascript
// BEFORE (broken)
const updateCategory = useUpdateCategory();        // ❌ No categoryId
const deleteCategory = useDeleteCategory();        // ❌ No categoryId
// Result: categoryId is undefined in both hooks
```

## Solution

### 1. Refactored `useUpdateCategory` Hook
**File**: `src/hooks/useCategories.js` (lines 99-137)

Changed from:
```javascript
export const useUpdateCategory = (categoryId, options = {}) => {
  // categoryId used directly
```

To:
```javascript
export const useUpdateCategory = (options = {}) => {
  return useMutation({
    mutationFn: async ({ categoryId, ...data }) => {
      // categoryId extracted from payload
```

**Benefit**: categoryId now comes from the mutation payload, not from hook instantiation

### 2. Refactored `useDeleteCategory` Hook
**File**: `src/hooks/useCategories.js` (lines 140-165)

Changed from:
```javascript
export const useDeleteCategory = (categoryId, options = {}) => {
  // categoryId used directly
```

To:
```javascript
export const useDeleteCategory = (options = {}) => {
  return useMutation({
    mutationFn: async (categoryId) => {
      // categoryId passed as mutation parameter
```

**Benefit**: categoryId now passed directly to mutateAsync

### 3. Updated `handleSubmit` Handler
**File**: `src/app/(admin)/admin/categories/page.jsx` (line 493)

Changed from:
```javascript
await updateCategory.mutateAsync({
  ...formData,
  name: formData.displayName.toLowerCase().replace(/\s+/g, '-'),
});
```

To:
```javascript
await updateCategory.mutateAsync({
  categoryId: editingCategory._id,    // ✅ Added categoryId
  ...formData,
  name: formData.displayName.toLowerCase().replace(/\s+/g, '-'),
});
```

### 4. Updated `handleDelete` Handler
**File**: `src/app/(admin)/admin/categories/page.jsx` (line 516)

Changed from:
```javascript
await deleteCategory.mutateAsync();    // ❌ No categoryId passed
```

To:
```javascript
await deleteCategory.mutateAsync(categoryId);    // ✅ categoryId passed
```

## Verification

✅ No TypeScript errors in:
- `src/hooks/useCategories.js`
- `src/app/(admin)/admin/categories/page.jsx`

✅ Hook initialization works correctly:
- `const updateCategory = useUpdateCategory();`
- `const deleteCategory = useDeleteCategory();`

## Expected Results

After deployment, the following should work:
- ✅ Edit category: `PUT /api/v1/categories/{id}` with correct categoryId
- ✅ Delete category: `DELETE /api/v1/categories/{id}` with correct categoryId
- ✅ Admin can now manage categories without 500 errors

## Files Modified

1. `FRONTEND_AUTH_IMPLEMENTATION/src/hooks/useCategories.js`
   - `useUpdateCategory` - refactored signature
   - `useDeleteCategory` - refactored signature

2. `FRONTEND_AUTH_IMPLEMENTATION/src/app/(admin)/admin/categories/page.jsx`
   - `handleSubmit` - added categoryId to payload
   - `handleDelete` - added categoryId parameter to mutateAsync

## Pattern Notes

This change aligns the category hooks with the product hooks pattern, where:
- `useDeleteProduct()` takes productId in `mutateAsync(productId)`
- `useUpdateProduct()` takes productId at hook creation (product-specific pattern)

For categories, both now take the ID through the mutation payload for consistency and flexibility.
