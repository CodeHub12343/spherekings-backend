# Product System - Common Patterns & Code Snippets

## Quick Reference for Developers

This document provides ready-to-use code snippets for common product system integration scenarios.

---

## Pattern 1: Basic Product Listing Page

```javascript
'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductList from '@/components/products/ProductList';
import { Loader, AlertCircle } from 'lucide-react';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('active');
  const [sort, setSort] = useState('newest');

  const { data, isLoading, error } = useProducts({
    page,
    limit: 12,
    status,
    sort
  });

  if (isLoading) return <div className="text-center py-8"><Loader className="animate-spin" /></div>;
  if (error) return <div className="text-red-500"><AlertCircle /> Error loading products</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* Filter Controls */}
      <div className="mb-6 flex gap-4">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Product Grid */}
      <ProductList
        products={data?.products || []}
        isLoading={isLoading}
        error={error}
        pagination={data?.pagination}
        onPageChange={setPage}
        onFilterChange={(filters) => {
          setStatus(filters.status);
          setSort(filters.sort);
          setPage(1);
        }}
      />
    </div>
  );
}
```

---

## Pattern 2: Search Products

```javascript
'use client';

import { useState } from 'react';
import { useSearchProducts } from '@/hooks/useProducts';
import ProductList from '@/components/products/ProductList';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('q') || '';
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSearchProducts(query, {
    page,
    limit: 12
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">
        <Search className="inline mr-2" />
        Search Results for: {query}
      </h1>

      {data?.pagination?.total === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found for "{query}"</p>
        </div>
      ) : (
        <ProductList
          products={data?.products || []}
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

---

## Pattern 3: Product Detail with Related Products

```javascript
'use client';

import { useProductDetail, useRelatedProducts } from '@/hooks/useProducts';
import ProductDetail from '@/components/products/ProductDetail';
import ProductCard from '@/components/products/ProductCard';
import { Loader } from 'lucide-react';

export default function ProductPage({ params }) {
  const { data: productData, isLoading } = useProductDetail(params.id);
  const { data: relatedData } = useRelatedProducts(params.id, 4);

  if (isLoading) return <div className="text-center py-8"><Loader className="animate-spin" /></div>;
  if (!productData?.product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto py-8">
      {/* Main Product Detail */}
      <ProductDetail product={productData.product} />

      {/* Related Products */}
      {relatedData?.products && relatedData.products.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedData.products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Pattern 4: Admin - Create Product

```javascript
'use client';

import { useCreateProduct } from '@/hooks/useProducts';
import ProductForm from '@/components/products/ProductForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateProductPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState(null);

  const { mutateAsync, isPending } = useCreateProduct({
    onSuccess: (data) => {
      // Show success message
      alert(`Product "${data.product.name}" created successfully!`);
      // Redirect to products list
      router.push('/admin/products');
    },
    onError: (error) => {
      setSubmitError(error.message);
    }
  });

  const handleSubmit = async (formData) => {
    setSubmitError(null);
    try {
      await mutateAsync(formData);
    } catch (error) {
      console.error('Creation failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {submitError}
        </div>
      )}

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
```

---

## Pattern 5: Admin - Edit Product

```javascript
'use client';

import { useProductDetail, useUpdateProduct } from '@/hooks/useProducts';
import ProductForm from '@/components/products/ProductForm';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const { data: productData, isLoading: isLoadingProduct } = useProductDetail(params.id);

  const { mutateAsync, isPending } = useUpdateProduct(params.id, {
    onSuccess: (data) => {
      alert(`Product "${data.product.name}" updated successfully!`);
      router.push('/admin/products');
    }
  });

  if (isLoadingProduct) return <div className="text-center py-8"><Loader /></div>;
  if (!productData?.product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <ProductForm
        product={productData.product}
        onSubmit={mutateAsync}
        isLoading={isPending}
      />
    </div>
  );
}
```

---

## Pattern 6: Admin Dashboard with Actions

```javascript
'use client';

import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProducts({ page, limit: 20 });
  const deleteProduct = useDeleteProduct({
    onSuccess: () => alert('Product deleted successfully')
  });
  const queryClient = useQueryClient();

  const handleDelete = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(productId);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={20} /> Create Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">SKU</th>
              <th className="border p-2 text-right">Price</th>
              <th className="border p-2 text-right">Stock</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.products?.map(product => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.sku || '-'}</td>
                <td className="border p-2 text-right">${product.price.toFixed(2)}</td>
                <td className="border p-2 text-right">{product.stock}</td>
                <td className="border p-2 text-center">
                  <span className={`px-2 py-1 rounded text-sm ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="border p-2 text-center flex gap-2 justify-center">
                  <Link
                    href={`/products/${product._id}`}
                    className="text-blue-500 hover:text-blue-700"
                    title="View"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={`/admin/products/${product._id}/edit`}
                    className="text-green-500 hover:text-green-700"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page} of {data?.pagination?.pages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === data?.pagination?.pages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Pattern 7: Stock Management

```javascript
'use client';

import { useUpdateStock } from '@/hooks/useProducts';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function StockManager({ product }) {
  const [quantity, setQuantity] = useState(1);
  const updateStock = useUpdateStock(product._id);

  const handleAddStock = async () => {
    await updateStock.mutateAsync({
      quantity,
      operation: 'add'
    });
    setQuantity(1);
  };

  const handleReduceStock = async () => {
    if (quantity > product.stock) {
      alert('Cannot reduce by more than available stock');
      return;
    }
    await updateStock.mutateAsync({
      quantity,
      operation: 'subtract'
    });
    setQuantity(1);
  };

  return (
    <div className="bg-white p-6 rounded border">
      <h3 className="text-lg font-semibold mb-4">Manage Stock</h3>

      <div className="mb-4">
        <p className="text-gray-600">Current Stock: <strong>{product.stock}</strong></p>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
          className="px-3 py-2 border rounded w-24"
          min="1"
        />
        <button
          onClick={handleAddStock}
          disabled={updateStock.isPending}
          className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} /> Add
        </button>
        <button
          onClick={handleReduceStock}
          disabled={updateStock.isPending}
          className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
        >
          <Minus size={18} /> Reduce
        </button>
      </div>

      {updateStock.isPending && <p className="text-blue-500">Updating...</p>}
      {updateStock.isError && <p className="text-red-500">Error updating stock</p>}
    </div>
  );
}
```

---

## Pattern 8: Featured Products Carousel

```javascript
'use client';

import { useFeaturedProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/products/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

export default function FeaturedProductsCarousel() {
  const { data, isLoading } = useFeaturedProducts(8);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold mb-4">Featured Products</h2>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow"
        >
          <ChevronLeft />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-12"
        >
          {data?.products.map(product => (
            <div key={product._id} className="min-w-[250px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
```

---

## Pattern 9: Product Filter Component

```javascript
'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';

export default function ProductFilters({ onFilterChange, products }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priceRange: 'all',
    sort: 'newest'
  });

  const categories = [...new Set(products?.map(p => p.category).filter(Boolean))];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 mb-4 md:hidden"
      >
        <Filter size={20} /> Filters
      </button>

      <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 ${!showFilters && 'hidden'} md:grid`}>
        {/* Status Filter */}
        <div>
          <label className="block font-semibold mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block font-semibold mb-2">Sort</label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

---

## Pattern 10: Error Boundary for Product Operations

```javascript
'use client';

import { useState } from 'react';

export default function ProductErrorBoundary({ children, onError }) {
  const [error, setError] = useState(null);

  const handleError = (err) => {
    setError(err);
    onError?.(err);
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <h3 className="font-bold">Error Loading Products</h3>
        <p>{error.message}</p>
        <button
          onClick={() => setError(null)}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Common Hooks Usage

### Get Products with Pagination
```javascript
const { data, isLoading, error, isFetching } = useProducts({
  page: 1,
  limit: 12,
  status: 'active'
});

console.log(data.products);        // Product array
console.log(data.pagination);      // { total, page, limit, pages }
```

### Search Products
```javascript
const { data } = useSearchProducts('laptop', {
  page: 1,
  limit: 12,
  minPrice: 500,
  maxPrice: 1500
});
```

### Get Featured
```javascript
const { data } = useFeaturedProducts(6);
```

### Get Details
```javascript
const { data: product } = useProductDetail(productId);
```

### Related Products
```javascript
const { data } = useRelatedProducts(productId, 4);
```

### Create Product
```javascript
const { mutateAsync } = useCreateProduct({
  onSuccess: (data) => console.log('Created:', data.product),
  onError: (error) => console.error(error)
});

await mutateAsync(productData);
```

### Update Product
```javascript
const { mutateAsync } = useUpdateProduct(productId);
await mutateAsync({ name: 'New Name', price: 99.99 });
```

### Delete Product
```javascript
const { mutateAsync } = useDeleteProduct();
await mutateAsync(productId);
```

### Update Stock
```javascript
const { mutateAsync } = useUpdateStock(productId);
await mutateAsync({ quantity: 50, operation: 'add' });
```

---

**Status**: ✅ Ready to Use  
**Last Updated**: March 14, 2026
