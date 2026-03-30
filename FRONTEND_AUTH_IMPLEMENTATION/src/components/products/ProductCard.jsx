'use client';

import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

const CardContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f3f4f6;
  overflow: hidden;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
`;

const Badge = styled.span`
  background: ${(props) => {
    switch (props.type) {
      case 'featured':
        return '#fbbf24';
      case 'sale':
        return '#ef4444';
      case 'new':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }};
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const StatusBadge = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: ${(props) => {
    if (props.status === 'out_of_stock') return '#ef4444';
    if (props.stock === 0) return '#ef4444';
    return '#10b981';
  }};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px 12px 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;

  ${CardContainer}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ActionButton = styled.button`
  flex: 1;
  background: ${(props) => (props.variant === 'primary' ? '#5b4dff' : 'rgba(255,255,255,0.2)')};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.variant === 'primary' ? '#4c3fcc' : 'rgba(255,255,255,0.3)')};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContentContainer = styled.div`
  padding: 16px;
`;

const Category = styled.p`
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 6px;
`;

const ProductName = styled(Link)`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 8px 0;
  text-decoration: none;
  line-height: 1.4;

  &:hover {
    color: #5b4dff;
  }
`;

const Description = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 8px 0;
  min-height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
`;

const Price = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: #9ca3af;
  text-decoration: line-through;
`;

const StockInfo = styled.p`
  font-size: 12px;
  color: ${(props) => (props.lowStock ? '#ef4444' : '#6b7280')};
  font-weight: ${(props) => (props.lowStock ? 600 : 400)};
  margin: 0;
`;

const VariantsContainer = styled.div`
  display: flex;
  gap: 6px;
  margin: 8px 0;
  flex-wrap: wrap;
`;

const VariantChip = styled.span`
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #6b7280;
`;

/**
 * ProductCard Component
 * Reusable card component for displaying product information
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {boolean} props.showActions - Show action buttons
 * @param {Function} props.onAddToCart - Add to cart callback
 * @param {Function} props.onWishlist - Wishlist callback
 */
const ProductCard = ({
  product,
  showActions = true,
  onAddToCart,
  onWishlist,
  ...rest
}) => {
  const {
    _id,
    name,
    description,
    price,
    images,
    stock,
    status,
    category,
    isFeatured,
    variants,
  } = product;

  const isOutOfStock = status === 'out_of_stock' || stock === 0;
  const lowStock = stock > 0 && stock < 5;

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      {...rest}
    >
      {/* Image Section */}
      <ImageContainer>
        <Image
          src={images?.[0] || '/images/placeholder-product.jpg'}
          alt={name}
          fill
          quality={75}
          priority={false}
          sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          style={{ objectFit: 'cover' }}
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E"
        />

        {/* Badges */}
        <BadgeContainer>
          {isFeatured && <Badge type="featured">Featured</Badge>}
        </BadgeContainer>

        {/* Status Badge */}
        <StatusBadge status={status} stock={stock}>
          {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
        </StatusBadge>

        {/* Action Buttons */}
        {showActions && !isOutOfStock && (
          <ActionButtons>
            <ActionButton
              variant="primary"
              onClick={onAddToCart}
              title="Add to cart"
            >
              <ShoppingCart />
              Add
            </ActionButton>
         {/*    <ActionButton onClick={onWishlist} title="Add to wishlist">
              <Heart />
            </ActionButton> */}
            <ActionButton
              as={Link}
              href={`/products/${_id}`}
              title="View details"
              style={{ textDecoration: 'none' }}
            >
              <Eye />
            </ActionButton>
          </ActionButtons>
        )}
      </ImageContainer>

      {/* Content Section */}
      <ContentContainer>
        {category && <Category>{category}</Category>}

        <ProductName href={`/products/${_id}`}>{name}</ProductName>

       {/*  {description && <Description>{description}</Description>} */}

        {/* Variants */}
        {variants && variants.length > 0 && (
          <VariantsContainer>
            {variants.map((variant, idx) => (
              <VariantChip key={idx}>
                {variant.name}: {variant.options.slice(0, 2).join(', ')}
                {variant.options.length > 2 ? '...' : ''}
              </VariantChip>
            ))}
          </VariantsContainer>
        )}

        {/* Price */}
        <PriceContainer>
          <Price>${price.toFixed(2)}</Price>
        </PriceContainer>

        {/* Stock Info */}
        <StockInfo lowStock={lowStock}>
          {isOutOfStock
            ? 'Out of stock'
            : lowStock
              ? `Only ${stock} left`
              : `${stock} in stock`}
        </StockInfo>
      </ContentContainer>
    </CardContainer>
  );
};

export default ProductCard;
