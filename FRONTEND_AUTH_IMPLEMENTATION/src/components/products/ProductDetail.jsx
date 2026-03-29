'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Heart, Share2, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import gallery components for code splitting
const ImageZoomGallery = dynamic(
  () => import('./ImageZoomGallery'),
  { loading: () => <div>Loading gallery...</div> }
);
const SwipeableImageCarousel = dynamic(
  () => import('./SwipeableImageCarousel'),
  { loading: () => <div>Loading carousel...</div> }
);

const DetailContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (max-width: 768px) {
    gap: 20px;
    padding: 0;
  }

  @media (max-width: 640px) {
    gap: 16px;
    width: 100%;
    padding: 0;
  }

  @media (max-width: 480px) {
    gap: 12px;
    width: 100%;
    padding: 0;
  }
`;

const ImageGallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 640px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const DesktopGallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileGallery = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MainImage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 640px) {
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    border-radius: 6px;
  }
`;

const ThumbnailContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
`;

const Thumbnail = styled.button`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid ${(props) => (props.active ? '#5b4dff' : '#e5e7eb')};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: none;
  padding: 0;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  &:hover {
    border-color: #5b4dff;
  }

  @media (max-width: 640px) {
    border-radius: 6px;
    border-width: 1px;
  }

  @media (max-width: 480px) {
    border-radius: 4px;
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    gap: 18px;
    width: 100%;
    padding: 0;
  }

  @media (max-width: 640px) {
    gap: 16px;
    width: 100%;
    padding: 0;
  }

  @media (max-width: 480px) {
    gap: 14px;
    width: 100%;
    padding: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  @media (max-width: 640px) {
    gap: 12px;
  }
`;

const TitleSection = styled.div`
  flex: 1;

  @media (max-width: 640px) {
    margin-right: 0;
  }
`;

const Category = styled.p`
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;

  @media (max-width: 640px) {
    font-size: 11px;
    margin: 0 0 6px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px;
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: break-word;
  word-wrap: break-word;
  max-width: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 24px;
    margin: 0 0 8px;
    word-break: break-word;
  }

  @media (max-width: 640px) {
    font-size: 22px;
    margin: 0 0 8px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    line-height: 1.3;
    margin: 0 0 6px;
  }
`;

const SKU = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;

  strong {
    color: #1f2937;
  }

  @media (max-width: 640px) {
    font-size: 11px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 12px;

  button {
    width: 44px;
    height: 44px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      border-color: #5b4dff;
      color: #5b4dff;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  @media (max-width: 640px) {
    button {
      width: 40px;
      height: 40px;
      border-radius: 6px;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const PriceSection = styled.div`
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 640px) {
    padding: 16px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const Price = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;

  @media (max-width: 640px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  .stars {
    color: #fbbf24;
  }

  @media (max-width: 640px) {
    font-size: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const Description = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: #4b5563;
  word-break: break-word;
  overflow-wrap: break-word;
  word-wrap: break-word;
  white-space: normal;
  max-width: 100%;
  overflow: hidden;

  p {
    margin: 0;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 1.5;
    max-width: 100%;
  }

  @media (max-width: 640px) {
    font-size: 13px;
    line-height: 1.5;
    word-break: break-word;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    line-height: 1.5;
  }
`;

const StockBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  background: ${(props) => (props.inStock ? '#d1fae5' : '#fee2e2')};
  color: ${(props) => (props.inStock ? '#065f46' : '#991b1b')};
  font-weight: 600;
  font-size: 14px;

  @media (max-width: 640px) {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 5px 10px;
    font-size: 11px;
  }
`;

const VariantsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 640px) {
    gap: 12px;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const VariantGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 640px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const VariantLabel = styled.label`
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  text-transform: capitalize;

  @media (max-width: 640px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const VariantOptions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const VariantOption = styled.button`
  padding: 10px 16px;
  border: 2px solid ${(props) => (props.selected ? '#5b4dff' : '#e5e7eb')};
  border-radius: 8px;
  background: ${(props) => (props.selected ? '#5b4dff' : 'white')};
  color: ${(props) => (props.selected ? 'white' : '#1f2937')};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    border-color: #5b4dff;
  }

  @media (max-width: 640px) {
    padding: 8px 12px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 11px;
    border-width: 1px;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  width: fit-content;

  button {
    width: 44px;
    height: 44px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 18px;
    color: #1f2937;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
    }
  }

  input {
    width: 60px;
    border: none;
    text-align: center;
    font-weight: 600;
    font-size: 16px;
    color: #1f2937;

    &:focus {
      outline: none;
      background: #f9fafb;
    }
  }

  @media (max-width: 640px) {
    button {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    input {
      width: 50px;
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    button {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }

    input {
      width: 44px;
      font-size: 13px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 640px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px;
  }
`;

const DetailItem = styled.div`
  text-align: center;

  .label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .value {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }

  @media (max-width: 480px) {
    text-align: left;
    padding: 8px;
    background: white;
    border-radius: 6px;

    .label {
      font-size: 11px;
      margin-bottom: 4px;
    }

    .value {
      font-size: 16px;
    }
  }
`;

/**
 * ProductDetail Component
 * Display full details of a single product
 */
const ProductDetail = ({ product, isLoading = false, onAddToCart = () => {} }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return <div>Loading product details...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const {
    name = 'Unnamed Product',
    description = '',
    price = 0,
    images = [],
    stock = 0,
    status = 'inactive',
    category = '',
    sku = '',
    variants = [],
    isFeatured = false,
  } = product;

  // Ensure price is a number
  const safePrice = typeof price === 'number' ? price : parseFloat(price) || 0;
  const safeStock = typeof stock === 'number' ? stock : parseInt(stock) || 0;

  const isOutOfStock = status === 'out_of_stock' || safeStock === 0;
  const mainImage = images[selectedImage] || images[0];

  const handleAddToCart = () => {
    onAddToCart({
      productId: product._id,
      quantity,
      selectedVariants,
    });
  };

  return (
    <DetailContainer>
      {/* Image Gallery */}
      <ImageGallery>
        {/* Desktop Gallery with Zoom */}
        <DesktopGallery>
          {mainImage && (
            <ImageZoomGallery 
              image={mainImage} 
              alt={name}
            />
          )}
          {images.length > 1 && (
            <ThumbnailContainer>
              {images.map((image, idx) => (
                <Thumbnail
                  key={idx}
                  active={idx === selectedImage}
                  onClick={() => setSelectedImage(idx)}
                >
                  <Image
                    src={image}
                    alt={`View ${idx + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </Thumbnail>
              ))}
            </ThumbnailContainer>
          )}
        </DesktopGallery>

        {/* Mobile Carousel */}
        <MobileGallery>
          {images.length > 0 && (
            <SwipeableImageCarousel 
              images={images}
              onImageChange={setSelectedImage}
            />
          )}
        </MobileGallery>
      </ImageGallery>

      {/* Content */}
      <ContentSection>
        <Header>
          <TitleSection>
            {category && <Category>{category}</Category>}
            <Title>{name}</Title>
            {sku && <SKU>SKU: <strong>{sku}</strong></SKU>}
          </TitleSection>
          <ActionIcons>
            <button title="Add to wishlist">
              <Heart />
            </button>
            <button title="Share product">
              <Share2 />
            </button>
          </ActionIcons>
        </Header>

        {/* Price and Stock */}
        <PriceSection>
          <div>
            <Price>${safePrice.toFixed(2)}</Price>
            <StockBadge inStock={!isOutOfStock}>
              {isOutOfStock ? 'Out of Stock' : `${safeStock} in stock`}
            </StockBadge>
          </div>
        </PriceSection>

        {/* Description */}
        {description && <Description>{description}</Description>}

        {/* Variants */}
        {variants.length > 0 && (
          <VariantsSection>
            {variants.map((variant) => (
              <VariantGroup key={variant.name}>
                <VariantLabel>{variant.name}</VariantLabel>
                <VariantOptions>
                  {variant.options.map((option) => (
                    <VariantOption
                      key={option}
                      selected={selectedVariants[variant.name] === option}
                      onClick={() =>
                        setSelectedVariants({
                          ...selectedVariants,
                          [variant.name]: option,
                        })
                      }
                    >
                      {option}
                    </VariantOption>
                  ))}
                </VariantOptions>
              </VariantGroup>
            ))}
          </VariantsSection>
        )}

        {/* Quantity */}
        <QuantitySelector>
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max={stock}
          />
          <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}>+</button>
        </QuantitySelector>

        {/* Action Buttons */}
        <ButtonGroup>
          <Button
            size="full"
            loading={false}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button size="full" variant="secondary">
            Buy Now
          </Button>
        </ButtonGroup>

        {/* Product Details */}
        <DetailsGrid>
          <DetailItem>
            <div className="label">Category</div>
            <div className="value">{category || 'N/A'}</div>
          </DetailItem>
          <DetailItem>
            <div className="label">Stock</div>
            <div className="value">{stock}</div>
          </DetailItem>
          <DetailItem>
            <div className="label">Status</div>
            <div className="value" style={{ textTransform: 'capitalize' }}>
              {status}
            </div>
          </DetailItem>
          {isFeatured && (
            <DetailItem>
              <div className="label">Featured</div>
              <div className="value">
                <TrendingUp size={24} style={{ margin: '0 auto' }} />
              </div>
            </DetailItem>
          )}
        </DetailsGrid>
      </ContentSection>
    </DetailContainer>
  );
};

export default ProductDetail;
