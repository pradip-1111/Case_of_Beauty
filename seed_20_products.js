const supabase = require('./supabase');

const seedData = async () => {
    console.log('--- Seeding 20 Botanical Beauty Products to Supabase ---');

    // 1. Categories
    const categoriesData = [
        { title: 'Skincare', image: 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=600&auto=format&fit=crop&q=80' },
        { title: 'Haircare', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80' },
        { title: 'Body Care', image: 'https://images.unsplash.com/photo-1556228722-d1191e3266ec?w=600&auto=format&fit=crop&q=80' },
        { title: 'Lip & Eye Care', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80' }
    ];

    console.log('Clearing old data...');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Inserting categories...');
    const { data: insertedCategories, error: catError } = await supabase
        .from('categories')
        .insert(categoriesData)
        .select();

    if (catError) {
        console.error('Error inserting categories:', catError.message);
    } else {
        console.log(`Inserted ${insertedCategories?.length} categories.`);
    }

    const catMap = {};
    if (insertedCategories) {
        insertedCategories.forEach(c => { catMap[c.title] = c.id; });
    }

    // 2. 20 Products
    const productsData = [
        {
            name: 'Golden Botanical Elixir Face Oil',
            description: 'Pure cold-pressed botanical oils infused with 24K gold flakes for intense nourishment and youthful glow.',
            price: 1499,
            discount_price: 1299,
            tag: 'BESTSELLER',
            is_new_launch: false,
            stock: 45,
            is_featured: true,
            rating: 4.9,
            reviews_count: 124,
            category_id: catMap['Skincare'] || null,
            image: 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Organic Neem & Tea Tree Cleansing Gel',
            description: 'Gentle clarifying facial cleanser infused with fresh neem extract and tea tree oil to purify pores.',
            price: 699,
            discount_price: 599,
            tag: 'ORGANIC',
            is_new_launch: false,
            stock: 60,
            is_featured: true,
            rating: 4.8,
            reviews_count: 88,
            category_id: catMap['Skincare'] || null,
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Prakriti Rose & Aloe Revitalizing Mist',
            description: 'Pure Steam-distilled Kannauj Rose water enriched with organic aloe vera for instant hydration and calming skin boost.',
            price: 799,
            discount_price: 649,
            tag: 'HYDRATING',
            is_new_launch: true,
            stock: 80,
            is_featured: true,
            rating: 4.9,
            reviews_count: 210,
            category_id: catMap['Skincare'] || null,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Kumkumadi Radiant Glow Night Serum',
            description: 'Ancient Ayurvedic formula with Kashmiri Saffron and 16 precious herbs for overnight skin brightness and spot correction.',
            price: 2199,
            discount_price: 1899,
            tag: 'LUXURY',
            is_new_launch: false,
            stock: 30,
            is_featured: true,
            rating: 5.0,
            reviews_count: 340,
            category_id: catMap['Skincare'] || null,
            image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Saffron & Sandalwood Youth Repair Cream',
            description: 'Deeply moisturizing night repair cream that firms skin texture and minimizes fine lines.',
            price: 1899,
            discount_price: 1599,
            tag: 'ANTI-AGING',
            is_new_launch: false,
            stock: 50,
            is_featured: false,
            rating: 4.9,
            reviews_count: 175,
            category_id: catMap['Skincare'] || null,
            image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Green Tea & Hyaluronic Clarifying Concentrate',
            description: 'Lightweight oil-free hydrating serum that balances sebum production and restores moisture balance.',
            price: 1299,
            discount_price: 1099,
            tag: 'NEW',
            is_new_launch: true,
            stock: 40,
            is_featured: false,
            rating: 4.7,
            reviews_count: 95,
            category_id: catMap['Skincare'] || null,
            image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Radiant Botanical Sunscreen Gel SPF 50',
            description: 'Non-greasy broad spectrum sun defense enriched with Centella and Green Tea extracts. Zero white cast.',
            price: 999,
            discount_price: 849,
            tag: 'SUN DEFENSE',
            is_new_launch: true,
            stock: 80,
            is_featured: true,
            rating: 4.9,
            reviews_count: 270,
            category_id: catMap['Skincare'] || null,
            image: 'https://images.unsplash.com/photo-1567928257065-c14669877d84?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Botanical Detox Clarifying Clay Mask',
            description: 'French Green Clay and Activated Charcoal mask that draws out toxins and refines pores in 10 minutes.',
            price: 1149,
            discount_price: 949,
            tag: 'PURIFYING',
            is_new_launch: false,
            stock: 45,
            is_featured: false,
            rating: 4.8,
            reviews_count: 145,
            category_id: catMap['Skincare'] || null,
            image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop&q=80'
        },

        // Haircare
        {
            name: 'Brahmi & Bhringraj Nourishing Hair Oil',
            description: 'Traditional slow-cooked herbal hair elixir that stimulates scalp circulation and stops hair fall.',
            price: 899,
            discount_price: 749,
            tag: 'HERBAL',
            is_new_launch: false,
            stock: 70,
            is_featured: true,
            rating: 4.9,
            reviews_count: 280,
            category_id: catMap['Haircare'] || null,
            image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Hibiscus & Coconut Intense Moisture Shampoo',
            description: 'Sulfate-free creamy botanical cleanser that restores silkiness and bounce to dry damaged hair.',
            price: 799,
            discount_price: 699,
            tag: 'SULFATE-FREE',
            is_new_launch: false,
            stock: 65,
            is_featured: true,
            rating: 4.8,
            reviews_count: 190,
            category_id: catMap['Haircare'] || null,
            image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Argan & Onion Scalp Revitalizing Mask',
            description: 'Deep conditioning spa mask enriched with Moroccan Argan oil and Red Onion extract for strength.',
            price: 1099,
            discount_price: 899,
            tag: 'REPAIR',
            is_new_launch: true,
            stock: 35,
            is_featured: false,
            rating: 4.8,
            reviews_count: 115,
            category_id: catMap['Haircare'] || null,
            image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Amla & Vitamin E Shine Hair Serum',
            description: 'Lightweight anti-frizz serum that seals split ends and gives hair luminous high-gloss shine.',
            price: 649,
            discount_price: 549,
            tag: 'SMOOTHING',
            is_new_launch: false,
            stock: 55,
            is_featured: false,
            rating: 4.7,
            reviews_count: 82,
            category_id: catMap['Haircare'] || null,
            image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&auto=format&fit=crop&q=80'
        },

        // Body Care
        {
            name: 'Velvet Jasmine & Shea Body Butter',
            description: 'Rich whip of raw Shea Butter and Night-Blooming Jasmine oil for 48-hour velvety soft hydration.',
            price: 1199,
            discount_price: 999,
            tag: 'RICH MOISTURE',
            is_new_launch: false,
            stock: 45,
            is_featured: true,
            rating: 4.9,
            reviews_count: 230,
            category_id: catMap['Body Care'] || null,
            image: 'https://images.unsplash.com/photo-1556228722-d1191e3266ec?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Coffee Bean & Cocoa Exfoliating Body Scrub',
            description: 'Freshly ground Arabica coffee and natural sugar crystals scrub to polish skin and target cellulite.',
            price: 849,
            discount_price: 699,
            tag: 'DETOX',
            is_new_launch: false,
            stock: 50,
            is_featured: true,
            rating: 4.9,
            reviews_count: 160,
            category_id: catMap['Body Care'] || null,
            image: 'https://images.unsplash.com/photo-1567928257065-c14669877d84?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Wild Rose & Almond Softening Body Lotion',
            description: 'Silky quick-absorbing body lotion infused with cold-pressed almond oil and wild rose essence.',
            price: 749,
            discount_price: 629,
            tag: 'DAILY CARE',
            is_new_launch: false,
            stock: 75,
            is_featured: false,
            rating: 4.8,
            reviews_count: 140,
            category_id: catMap['Body Care'] || null,
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Eucalyptus & Lemongrass Refreshing Wash',
            description: 'Energizing aromatherapeutic body wash that revives senses and leaves skin fresh and supple.',
            price: 599,
            discount_price: 499,
            tag: 'SPA FRESH',
            is_new_launch: false,
            stock: 85,
            is_featured: false,
            rating: 4.7,
            reviews_count: 90,
            category_id: catMap['Body Care'] || null,
            image: 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=600&auto=format&fit=crop&q=80'
        },

        // Lip & Eye Care
        {
            name: 'Organic Honey & Vanilla Lip Butter',
            description: 'Ultra-soothing treatment balm crafted with raw honey, beeswax, and pure vanilla pod extract.',
            price: 399,
            discount_price: 349,
            tag: 'NOURISHING',
            is_new_launch: false,
            stock: 100,
            is_featured: true,
            rating: 4.9,
            reviews_count: 310,
            category_id: catMap['Lip & Eye Care'] || null,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Rosehip & Peptide Overnight Eye Cream',
            description: 'Advanced eye treatment that visibly reduces dark circles, puffiness, and crow’s feet overnight.',
            price: 1399,
            discount_price: 1199,
            tag: 'ANTI-DARK CIRCLE',
            is_new_launch: true,
            stock: 40,
            is_featured: true,
            rating: 4.8,
            reviews_count: 120,
            category_id: catMap['Lip & Eye Care'] || null,
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Tinted Beetroot & Cocoa Butter Lip Balm',
            description: 'Natural rosy pink tint infused with beetroot extract and ultra-moisturizing cocoa butter.',
            price: 449,
            discount_price: 379,
            tag: 'NATURAL TINT',
            is_new_launch: false,
            stock: 90,
            is_featured: false,
            rating: 4.8,
            reviews_count: 185,
            category_id: catMap['Lip & Eye Care'] || null,
            image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Cucumber & Matcha Cooling Eye Gel',
            description: 'Refreshing eye contour gel with cucumber extract and Japanese matcha to de-puff tired eyes.',
            price: 999,
            discount_price: 849,
            tag: 'SOOTHING',
            is_new_launch: true,
            stock: 50,
            is_featured: false,
            rating: 4.9,
            reviews_count: 105,
            category_id: catMap['Lip & Eye Care'] || null,
            image: 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=600&auto=format&fit=crop&q=80'
        }
    ];

    console.log('Inserting 20 products...');
    const { data: insertedProducts, error: prodError } = await supabase
        .from('products')
        .insert(productsData)
        .select();

    if (prodError) {
        console.error('Error inserting products:', prodError.message);
    } else {
        console.log(`Successfully seeded ${insertedProducts?.length} products!`);
    }

    console.log('--- Seeding Completed Successfully ---');
};

seedData().then(() => process.exit(0)).catch(err => {
    console.error('Seed script error:', err);
    process.exit(1);
});
