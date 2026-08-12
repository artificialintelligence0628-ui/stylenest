import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { syncDb, User, Product } from './models/index.js'

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const PRODUCTS = [
  { name: 'Ridgeline Field Jacket', category: 'Men', type: 'jacket', price: 420, compareAtPrice: 520, tag: 'SALE', rating: 4.7, reviewCount: 38,
    colors: [{ name: 'Olive', hex: '#3c4a35' }, { name: 'Sand', hex: '#c9b28a' }, { name: 'Ink', hex: '#1c1c1c' }], sizes: ['S', 'M', 'L', 'XL'],
    description: 'A structured field jacket cut from brushed cotton twill, built for shoulder-season layering. Storm flap, corozo buttons, two chest pockets.' },
  { name: 'Meadow Wrap Dress', category: 'Women', type: 'dress', price: 340, compareAtPrice: null, tag: 'NEW', rating: 4.9, reviewCount: 52,
    colors: [{ name: 'Clay', hex: '#a8583f' }, { name: 'Cream', hex: '#efe6d3' }, { name: 'Forest', hex: '#2e4635' }], sizes: ['XS', 'S', 'M', 'L'],
    description: 'A softly draped wrap silhouette in washed viscose crepe. Self-tie waist, midi length, side seam pockets.' },
  { name: 'Everyday Crew Tee', category: 'Men', type: 'tshirt', price: 95, compareAtPrice: null, tag: '', rating: 4.5, reviewCount: 120,
    colors: [{ name: 'White', hex: '#f4f1e9' }, { name: 'Ink', hex: '#1c1c1c' }, { name: 'Brass', hex: '#b08d4f' }], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Heavyweight combed cotton, garment-dyed for a lived-in hand. A wardrobe staple built to outlast a season.' },
  { name: 'Harbor Wide Trousers', category: 'Women', type: 'trousers', price: 265, compareAtPrice: null, tag: 'NEW', rating: 4.6, reviewCount: 29,
    colors: [{ name: 'Stone', hex: '#cfc6ae' }, { name: 'Ink', hex: '#1c1c1c' }], sizes: ['XS', 'S', 'M', 'L'],
    description: 'High-rise wide-leg trousers in a heavy drape twill. Pleated front, welt back pockets, tailored waistband.' },
  { name: 'Pleated Midi Skirt', category: 'Women', type: 'skirt', price: 230, compareAtPrice: 290, tag: 'SALE', rating: 4.4, reviewCount: 19,
    colors: [{ name: 'Plum', hex: '#5b3a4e' }, { name: 'Cream', hex: '#efe6d3' }], sizes: ['XS', 'S', 'M', 'L'],
    description: 'Knife-pleated midi skirt in a fluid satin-back crepe that catches the light with every step.' },
  { name: 'Trail Low Sneaker', category: 'Shoes', type: 'shoe', price: 380, compareAtPrice: null, tag: 'BESTSELLER', rating: 4.8, reviewCount: 210,
    colors: [{ name: 'Bone', hex: '#e7e1d2' }, { name: 'Forest', hex: '#2e4635' }, { name: 'Rust', hex: '#8b4032' }], sizes: ['38', '39', '40', '41', '42', '43', '44'],
    description: 'A low-profile trainer in nubuck and recycled mesh with a cushioned EVA sole for all-day wear.' },
  { name: 'Nest Woven Tote', category: 'Accessories', type: 'bag', price: 180, compareAtPrice: null, tag: 'NEW', rating: 4.7, reviewCount: 44,
    colors: [{ name: 'Natural', hex: '#c9b28a' }, { name: 'Ink', hex: '#1c1c1c' }], sizes: ['One Size'],
    description: 'Hand-woven raffia tote lined in canvas, with a leather-wrapped top handle and interior pocket.' },
  { name: 'Kids Explorer Hoodie', category: 'Kids', type: 'jacket', price: 150, compareAtPrice: null, tag: '', rating: 4.6, reviewCount: 33,
    colors: [{ name: 'Sky', hex: '#7d94a3' }, { name: 'Brass', hex: '#b08d4f' }], sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    description: 'Brushed-back fleece hoodie with a kangaroo pocket and adjustable hood, built for the school run and beyond.' },
  { name: 'Linen Weekend Shirt', category: 'Men', type: 'tshirt', price: 210, compareAtPrice: null, tag: 'BESTSELLER', rating: 4.5, reviewCount: 88,
    colors: [{ name: 'White', hex: '#f4f1e9' }, { name: 'Sand', hex: '#c9b28a' }, { name: 'Sky', hex: '#7d94a3' }], sizes: ['S', 'M', 'L', 'XL'],
    description: 'Pure European linen in a relaxed boxy cut, garment-washed for softness from the first wear.' },
  { name: 'Terrace Sun Hat', category: 'Accessories', type: 'hat', price: 120, compareAtPrice: null, tag: '', rating: 4.3, reviewCount: 15,
    colors: [{ name: 'Natural', hex: '#c9b28a' }, { name: 'Ink', hex: '#1c1c1c' }], sizes: ['One Size'],
    description: 'A wide-brimmed hat woven from natural straw fibre with a grosgrain band, packable for travel.' },
  { name: 'Kids Print Sundress', category: 'Kids', type: 'dress', price: 110, compareAtPrice: null, tag: 'NEW', rating: 4.8, reviewCount: 27,
    colors: [{ name: 'Clay', hex: '#a8583f' }, { name: 'Cream', hex: '#efe6d3' }], sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    description: 'A lightweight cotton sundress with a hand-drawn print, elastic waist and adjustable straps.' },
  { name: 'Studio Ankle Boot', category: 'Shoes', type: 'shoe', price: 460, compareAtPrice: 540, tag: 'SALE', rating: 4.9, reviewCount: 61,
    colors: [{ name: 'Ink', hex: '#1c1c1c' }, { name: 'Clay', hex: '#a8583f' }], sizes: ['37', '38', '39', '40', '41'],
    description: 'A minimal ankle boot in full-grain leather with a stacked block heel and interior zip closure.' },
]

async function main() {
  await syncDb({ alter: true })
  console.log('Seeding database...')

  for (const p of PRODUCTS) {
    const slug = slugify(p.name)
    const [product, created] = await Product.findOrCreate({
      where: { slug },
      defaults: { ...p, slug },
    })
    console.log(created ? `Created: ${product.name}` : `Already exists: ${product.name}`)
  }

  const adminEmail = 'admin@stylenest.com'
  const existingAdmin = await User.findOne({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('admin123', 10)
    await User.create({ name: 'Store Admin', email: adminEmail, password: hashed, role: 'ADMIN' })
    console.log(`Seeded admin user: ${adminEmail} / admin123 (change this password!)`)
  } else {
    console.log('Admin user already exists.')
  }

  console.log('Done.')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
