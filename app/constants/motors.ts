export interface Motor {
  id: string;
  name: string;
  description: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  weekendPrice: number;
  transmission: string;
  fuel: string;
  rating: number;
  image: string;
  year: string;
  cc: string;
  brand: string;
}

export const MOTORS_DATA: Motor[] = [
  {
    id: 'beat-esp-2015',
    name: 'Honda Beat ESP 2015',
    description: 'Motor matic legendaris yang irit bensin dan lincah untuk jalanan perkotaan.',
    dailyPrice: 70000,
    weeklyPrice: 420000,
    monthlyPrice: 1500000,
    weekendPrice: 150000,
    transmission: 'Matic',
    fuel: 'Bensin',
    rating: 4.7,
    image: '/motors/beat-esp-2015.jpg',
    year: '2015',
    cc: '110cc',
    brand: 'Honda'
  },
  {
    id: 'beat-eco-2017',
    name: 'Honda Beat Eco 2017',
    description: 'Generasi Beat dengan teknologi Eco Indicator untuk efisiensi bahan bakar maksimal.',
    dailyPrice: 80000,
    weeklyPrice: 490000,
    monthlyPrice: 1800000,
    weekendPrice: 175000,
    transmission: 'Matic',
    fuel: 'Bensin',
    rating: 4.8,
    image: '/motors/beat-eco-2017.jpg',
    year: '2017',
    cc: '110cc',
    brand: 'Honda'
  },
  {
    id: 'beat-cbs-2019',
    name: 'Honda Beat CBS 2019',
    description: 'Dilengkapi sistem pengereman CBS untuk keamanan berkendara yang lebih baik.',
    dailyPrice: 90000,
    weeklyPrice: 560000,
    monthlyPrice: 2100000,
    weekendPrice: 200000,
    transmission: 'Matic',
    fuel: 'Bensin',
    rating: 4.8,
    image: '/motors/beat-cbs-2021-hitam.jpg',
    year: '2019',
    cc: '110cc',
    brand: 'Honda'
  },
  {
    id: 'beat-deluxe-2020',
    name: 'Honda Beat Deluxe 2020',
    description: 'Varian tertinggi dengan power charger dan desain yang lebih elegan.',
    dailyPrice: 95000,
    weeklyPrice: 595000,
    monthlyPrice: 2250000,
    weekendPrice: 225000,
    transmission: 'Matic',
    fuel: 'Bensin',
    rating: 4.9,
    image: '/motors/beat-deluxe-2020.jpg',
    year: '2020',
    cc: '110cc',
    brand: 'Honda'
  },
  {
    id: 'beat-deluxe-2021',
    name: 'Honda Beat Deluxe 2021',
    description: 'Kondisi mesin sangat prima dengan balutan warna matte yang mewah.',
    dailyPrice: 100000,
    weeklyPrice: 630000,
    monthlyPrice: 2400000,
    weekendPrice: 250000,
    transmission: 'Matic',
    fuel: 'Bensin',
    rating: 4.9,
    image: '/motors/beat-deluxe-2021.jpg',
    year: '2021',
    cc: '110cc',
    brand: 'Honda'
  },
  {
    id: 'new-beat-cbs-2024',
    name: 'New Beat CBS 2024',
    description: 'Model terbaru dengan teknologi rangka eSAF yang lebih ringan dan stabil.',
    dailyPrice: 115000,
    weeklyPrice: 735000,
    monthlyPrice: 2850000,
    weekendPrice: 275000,
    transmission: 'Matic',
    fuel: 'Bensin',
    rating: 5.0,
    image: '/motors/beat-cbs-2024.jpg',
    year: '2024',
    cc: '110cc',
    brand: 'Honda'
  },
  {
    id: 'new-beat-cbs-2025',
    name: 'New Beat CBS 2025',
    description: 'Unit gress keluaran terbaru, performa mesin 100% seperti baru dari dealer.',
    dailyPrice: 125000,
    weeklyPrice: 805000,
    monthlyPrice: 3000000,
    weekendPrice: 300000,
    transmission: 'Matic',
    fuel: 'Bensin',
    rating: 5.0,
    image: '/motors/beat-cbs-2025.jpeg',
    year: '2025',
    cc: '110cc',
    brand: 'Honda'
  },
  {
    id: 'vario-2015',
    name: 'Honda Vario 125 2015',
    description: 'Tenaga lebih besar dengan bagasi yang sangat luas, muat untuk helm.',
    dailyPrice: 150000,
    weeklyPrice: 945000,
    monthlyPrice: 3600000,
    weekendPrice: 350000,
    transmission: 'Matic',
    fuel: 'Bensin',
    rating: 4.7,
    image: '/motors/vario-125.jpg',
    year: '2015',
    cc: '125cc',
    brand: 'Honda'
  }
];