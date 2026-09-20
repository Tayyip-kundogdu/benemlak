import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Square, Tag } from 'lucide-react';

export const PropertyCard = ({ property }) => {
  if (!property) return null;

  const {
    id,
    title,
    slug,
    price,
    type, // 'sale' | 'rent' | 'Satılık' | 'Kiralık'
    category,
    city = 'Çorum',
    district,
    neighborhood,
    bedroomCount,
    bathroomCount,
    areaNet,
    area,
    images = [],
    isFeatured,
    featured
  } = property;

  const mainImage = images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  const displayArea = areaNet || area;
  const isPropertyFeatured = isFeatured || featured;

  const formatPrice = (amount) => {
    if (!amount) return 'Fiyat Belirtilmedi';
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#224239]/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Görsel ve Rozetler */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={mainImage}
          alt={title || 'İlan'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider text-white ${
            type === 'sale' || type === 'Satılık' ? 'bg-[#D96B43]' : 'bg-[#224239]'
          }`}>
            {type === 'sale' ? 'Satılık' : type === 'rent' ? 'Kiralık' : type}
          </span>
          {isPropertyFeatured && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500 text-white shadow-sm">
              Öne Çıkan
            </span>
          )}
        </div>
        {category && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
            <Tag size={12} />
            <span className="capitalize">{category.name}</span>
          </div>
        )}
      </div>

      {/* Kart İçeriği */}
      <div className="p-5 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Konum */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin size={14} className="text-[#D96B43] shrink-0" />
            <span className="truncate">{city} {district ? `/ ${district}` : ''} {neighborhood ? `- ${neighborhood}` : ''}</span>
          </div>

          {/* Başlık */}
          <h3 className="font-bold text-lg text-[#224239] group-hover:text-[#D96B43] transition-colors line-clamp-2 mb-3">
            <Link to={`/ilan/${slug || id}`}>
              {title}
            </Link>
          </h3>
        </div>

        <div>
          {/* İlan Özellikleri */}
          <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-gray-100 text-xs text-gray-600">
            {bedroomCount !== undefined && (
              <div className="flex items-center gap-1">
                <BedDouble size={15} className="text-[#224239]" />
                <span>{bedroomCount} Oda</span>
              </div>
            )}
            {bathroomCount !== undefined && (
              <div className="flex items-center gap-1">
                <Bath size={15} className="text-[#224239]" />
                <span>{bathroomCount} Banyo</span>
              </div>
            )}
            {displayArea && (
              <div className="flex items-center gap-1">
                <Square size={15} className="text-[#224239]" />
                <span>{displayArea} m²</span>
              </div>
            )}
          </div>

          {/* Fiyat ve İncele Butonu */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-gray-400 block">Fiyat</span>
              <span className="text-xl font-extrabold text-[#224239]">
                {formatPrice(price)} TL
              </span>
            </div>
            <Link
              to={`/ilan/${slug || id}`}
              className="px-4 py-2 bg-[#F7F5EE] hover:bg-[#224239] text-[#224239] hover:text-white text-sm font-semibold rounded-xl transition-colors duration-200"
            >
              Detaylar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hem named hem de default import çakışmalarını önlemek için:
export default PropertyCard;