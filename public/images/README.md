# Image Assets

## Folder Structure

- `gallery/` - Foto galeri rental motor
- `icons/` - Icon dan SVG kecil
- `logos/` - Logo perusahaan
- `banners/` - Banner dan hero images

## Naming Convention

- Gunakan lowercase dan dash: `honda-vario-125.jpg`
- Format: `[kategori]-[nama]-[variant].[ext]`
- Contoh: `motor-honda-beat-street.jpg`

## Recommended Sizes

- Motor images: 800x600px (4:3 ratio)
- Banner images: 1920x1080px (16:9 ratio) 
- Logo: 300x150px
- Icons: 64x64px atau SVG

## Usage in Components

```tsx
import Image from 'next/image';

<Image
  src="/images/gallery/rental-shop.jpg"
  alt="Rental Motor Kukusan Shop"
  width={800}
  height={600}
  className="rounded-lg"
/>
```
