const fs = require('fs');
let data = fs.readFileSync('data.js', 'utf8');

const images = {
  shawarma: 'https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?auto=format&fit=crop&w=400&q=80',
  zinger: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  grill: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  drink: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
};

data = data.replace(/https:\/\/picsum\.photos\/seed\/[^'"]+/g, (match) => {
  if (match.includes('shawarma')) return images.shawarma;
  if (match.includes('zinger')) return images.zinger;
  if (match.includes('burger')) return images.burger;
  if (match.includes('pizza')) return images.pizza;
  if (match.includes('grill') || match.includes('meat') || match.includes('kebab')) return images.grill;
  if (match.includes('drink') || match.includes('cola') || match.includes('pepsi') || match.includes('water')) return images.drink;
  return images.default;
});

fs.writeFileSync('data.js', data);
console.log('Fixed data.js images');
