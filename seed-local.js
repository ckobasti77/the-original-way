const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require('convex/browser');

// 1. Load NEXT_PUBLIC_CONVEX_URL from .env.local
const envLocalPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.error("Fajl .env.local nije pronadjen!");
  process.exit(1);
}

const envContent = fs.readFileSync(envLocalPath, 'utf-8');
const match = envContent.match(/NEXT_PUBLIC_CONVEX_URL=(.*)/);
if (!match) {
  console.error("NEXT_PUBLIC_CONVEX_URL nije definisan u .env.local!");
  process.exit(1);
}

const convexUrl = match[1].trim();
console.log(`Povezivanje na Convex: ${convexUrl}`);

const client = new ConvexHttpClient(convexUrl);

const list = [
  { name: "Napapijri", filename: "napapijri.svg", contentType: "image/svg+xml" },
  { name: "Lacoste", filename: "lacoste.svg", contentType: "image/svg+xml" },
  { name: "Nike", filename: "nike.svg", contentType: "image/svg+xml" },
  { name: "Tommy Hilfiger", filename: "tommy-hilfiger.svg", contentType: "image/svg+xml" },
  { name: "Hugo", filename: "hugo.svg", contentType: "image/svg+xml" },
  { name: "Diesel", filename: "diesel.svg", contentType: "image/svg+xml" },
  { name: "Lyle&Scott", filename: "lyle-scott.svg", contentType: "image/svg+xml" },
  { name: "Ralph Lauren", filename: "ralph-lauren.svg", contentType: "image/svg+xml" },
  { name: "The North Face", filename: "the-north-face.svg", contentType: "image/svg+xml" },
  { name: "Jordan", filename: "jordan.svg", contentType: "image/svg+xml" },
  { name: "Adidas", filename: "adidas.svg", contentType: "image/svg+xml" },
  { name: "Stone Island", filename: "stone-island.svg", contentType: "image/svg+xml" },
  { name: "Calvin Klein", filename: "calvin-klein.svg", contentType: "image/svg+xml" },
  { name: "Parajumpers", filename: "parajumpers.svg", contentType: "image/svg+xml" },
  { name: "Boss", filename: "boss.svg", contentType: "image/svg+xml" },
  { name: "Furla", filename: "furla.svg", contentType: "image/svg+xml" }
];

async function run() {
  console.log("Ciscenje baze brendova...");
  await client.mutation("brands:clear");

  const logosDir = path.join(__dirname, 'public', 'logos');

  for (const b of list) {
    const filePath = path.join(logosDir, b.filename);
    if (!fs.existsSync(filePath)) {
      console.log(`Fajl nije pronadjen: ${filePath}, preskacem...`);
      continue;
    }

    console.log(`Ucitavanje lokalnog fajla za: ${b.name}...`);
    try {
      const buffer = fs.readFileSync(filePath);

      // Generate upload URL via Convex client
      const uploadUrl = await client.mutation("files:generateUploadUrl");

      console.log(`Otpremanje logotipa u Convex storage za ${b.name}...`);
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': b.contentType
        },
        body: buffer
      });

      if (!uploadRes.ok) {
        throw new Error(`Greska pri otpremanju: ${uploadRes.statusText}`);
      }

      const { storageId } = await uploadRes.json();
      console.log(`Uspesno otpremljeno! storageId: ${storageId}`);

      // Save brand to DB via Convex client
      await client.mutation("brands:seedWithStorage", { name: b.name, logoStorageId: storageId });
      console.log(`Uspesno sacuvan brend ${b.name} u bazi.`);
    } catch (err) {
      console.error(`Greska za brend ${b.name}:`, err.message);
    }
  }

  console.log("Zavrseno lokalno seed-ovanje brendova iz public/logos foldera sa Convex HTTP klijentom!");
}

run();
