// Interface tipe data Ulasan Produk Spesifik untuk tampilan modal detail hidangan
export interface ProductReview {
  id: string; // ID unik ulasan
  author: string; // Nama pengulas/pelanggan
  avatar: string; // URL foto avatar pengulas
  rating: number; // Nilai rating (1-5 bintang)
  text: string; // Teks isi testimoni ulasan
  image?: string; // URL gambar foto makanan ulasan (opsional)
}

/**
  * Fungsi PBO Helper: Menghasilkan ulasan pelanggan spesifik yang relevan dengan nama menu hidangan.
  * Bahasa Indonesia 100% dan relevan dengan cita rasa produk.
  */
export function getProductSpecificReviews(productName: string, productImage?: string): ProductReview[] {
  // Ubah nama produk ke huruf kecil untuk pencocokan string
  const name = (productName || '').toLowerCase();
  
  // Jika produk adalah Ayam Bakar atau olahan Ayam
  if (name.includes('ayam bakar') || name.includes('ayam')) {
    return [
      {
        id: 'r1',
        author: 'Amanda Rizky',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Ayam bakarnya sangat empuk dan bumbu kecap rempahnya meresap sempurna sampai ke dalam tulang. Sambalnya juga pedas mantap!"',
        image: productImage || '/images/ayam_bakar.jpg'
      },
      {
        id: 'r2',
        author: 'Dimas Pratama',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Porsi ayam pejantannya lumayan besar, dibakar pas tanpa gosong berlebih. Bumbu rempahnya manis gurih kaya rasa khas masakan rumah."'
      },
      {
        id: 'r3',
        author: 'Budi Hartono',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Pengemasan sangat rapi dan rapat, pesanan tiba dalam keadaan hangat dan harum bumbu bakarnya sangat menggugah selera."'
      }
    ];
  }

  // Jika produk adalah Nasi Bakar atau olahan Nasi
  if (name.includes('nasi bakar') || name.includes('nasi')) {
    return [
      {
        id: 'r1',
        author: 'Siti Rahmawati',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Nasi bakarnya beraroma wangi daun pisang yang khas, isian cumi pedasnya melimpah dan gurih tidak amis sama sekali."',
        image: productImage || '/images/nasi_bakar.jpg'
      },
      {
        id: 'r2',
        author: 'Rian Pratama',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Rasa gurih rempahnya pas banget di lidah. Porsi mengenyangkan dan harganya sangat bersahabat untuk makan siang."'
      },
      {
        id: 'r3',
        author: 'Amanda Rizky',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        text: '"Sensasi bakarannya dapet banget, pedas cuminya pas dan bumbunya meresap ke dalam nasinya. Pasti order lagi!"'
      }
    ];
  }

  // Jika produk adalah Krecek Kulit Sapi
  if (name.includes('krecek')) {
    return [
      {
        id: 'r1',
        author: 'Dewi Lestari',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Kreceknya teksturnya kenyal dan lembut, santannya kental gurih dengan kepedasan cabai rawit utuh yang menggoyang lidah."',
        image: productImage || '/images/krecek.jpg'
      },
      {
        id: 'r2',
        author: 'Ahmad Zakky',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Paduan kacang tolo dan krecek sapi pedasnya pas banget disandingkan dengan gudeg atau sekadar nasi hangat."'
      },
      {
        id: 'r3',
        author: 'Dimas Pratama',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Lauk favorit keluarga saat santai. Bumbunya legit dan kuah santannya gurih alami."'
      }
    ];
  }

  // Jika produk adalah Gudeg Jogja
  if (name.includes('gudeg')) {
    return [
      {
        id: 'r1',
        author: 'Nizar Azzuhra',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Gudeg Jogja paling otentik! Manisnya pas gula jawa asli, nangka mudanya empuk disajikan lengkap dengan suwiran ayam dan telur bacem."',
        image: productImage || '/images/gudeg.jpg'
      },
      {
        id: 'r2',
        author: 'Siti Rahmawati',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Rasa krecek dan suwiran ayamnya melimpah. Serasa menikmati gudeg langsung di Malioboro Jogja."'
      },
      {
        id: 'r3',
        author: 'Budi Hartono',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Kemasan sangat higienis, porsi komplet memuaskan dan tekstur bacemnya manis legit meresap."'
      }
    ];
  }

  // Jika produk adalah Garang Asam Ayam Kampung
  if (name.includes('garang asam') || name.includes('garang')) {
    return [
      {
        id: 'r1',
        author: 'Budi Hartono',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Kuah garang asamnya segar luar biasa! Campuran asam belimbing wulung dan gurih ayam kampungnya bikin nambah nasi terus."',
        image: productImage || '/images/garang_asam.jpg'
      },
      {
        id: 'r2',
        author: 'Amanda Rizky',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Ayam kampungnya sangat empuk dikukus dalam balutan daun pisang harum. Asam pedas gurihnya menyegarkan."'
      },
      {
        id: 'r3',
        author: 'Dimas Pratama',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        text: '"Kuahnya melimpah dengan irisan tomat hijau dan cabai rawit utuh. Hangat nikmat disajikan siang hari."'
      }
    ];
  }

  // Jika produk adalah Minuman Jus Segar
  if (name.includes('jus')) {
    return [
      {
        id: 'r1',
        author: 'Amanda Rizky',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Jus buahnya terasa murni kental dari buah asli segar tanpa banyak campuran air atau pemanis buatan."',
        image: productImage || '/images/jus_mangga.jpg'
      },
      {
        id: 'r2',
        author: 'Dimas Pratama',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '"Sangat segar mendampingi makanan berat pedas gurih Nefakky. Rasa buahnya manis segar alami!"'
      },
      {
        id: 'r3',
        author: 'Dewi Lestari',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        text: '"Dikemas dalam botol tertutup rapih, tiba dalam keadaan tetap dingin dan segar."'
      }
    ];
  }

  // Fallback ulasan umum jika nama produk tidak mencocokkan kategori utama
  return [
    {
      id: 'r1',
      author: 'Amanda Rizky',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      text: `"Rasa ${productName} ini sangat otentik dan lezat! Bumbu rempahnya meresap sempurna dan teksturnya empuk nikmat."`,
      image: productImage
    },
    {
      id: 'r2',
      author: 'Dimas Pratama',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      text: `"Sangat sepadan dengan harganya. Cita rasa kuliner rumahan dipadu pengemasan bersih dan hangat. Pasti akan beli lagi ${productName} ini."`
    },
    {
      id: 'r3',
      author: 'Budi Hartono',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4,
      text: `"Pengemasan sangat rapi dan ramah. Pesanan tiba dalam keadaan hangat dan bumbunya pas di lidah."`
    }
  ];
}

