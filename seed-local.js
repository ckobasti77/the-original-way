const { spawnSync } = require('child_process');

const list = [
  {
    name: "Napapijri",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 45">
  <g transform="translate(5, 5)">
    <rect x="0" y="5" width="45" height="30" fill="#C8102E" rx="2"/>
    <rect x="15" y="5" width="8" height="30" fill="#FFF"/>
    <rect x="0" y="16" width="45" height="8" fill="#FFF"/>
    <rect x="17" y="5" width="4" height="30" fill="#00205B"/>
    <rect x="0" y="18" width="45" height="4" fill="#00205B"/>
    <text x="55" y="26" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="16" fill="currentColor" letter-spacing="2">NAPAPIJRI</text>
  </g>
</svg>`
  },
  {
    name: "Lacoste",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="currentColor">
  <text x="50%" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="3">LACOSTE</text>
</svg>`
  },
  {
    name: "Nike",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
  <path d="M15 65 C 35 65, 75 40, 85 20 C 85 20, 65 45, 30 58 C 20 62, 10 63, 10 63 Z" />
</svg>`
  },
  {
    name: "Tommy Hilfiger",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 45">
  <g transform="translate(5, 5)">
    <rect x="0" y="5" width="45" height="30" fill="#002855" rx="2"/>
    <rect x="8" y="10" width="29" height="20" fill="#FFF"/>
    <rect x="22.5" y="10" width="14.5" height="20" fill="#C8102E"/>
    <text x="55" y="26" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="14" fill="currentColor" letter-spacing="2">TOMMY</text>
  </g>
</svg>`
  },
  {
    name: "Hugo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="currentColor">
  <text x="50%" y="30" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="4">HUGO</text>
</svg>`
  },
  {
    name: "Diesel",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="currentColor">
  <rect width="120" height="40" rx="4" fill="#C8102E" />
  <text x="50%" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="22" fill="#FFF" text-anchor="middle" letter-spacing="2">DIESEL</text>
</svg>`
  },
  {
    name: "Lyle&Scott",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 40" fill="currentColor">
  <text x="50%" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="2">LYLE &amp; SCOTT</text>
</svg>`
  },
  {
    name: "Ralph Lauren",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" fill="currentColor">
  <text x="50%" y="26" font-family="'Source Sans 3', sans-serif" font-weight="800" font-size="16" text-anchor="middle" letter-spacing="3">RALPH LAUREN</text>
</svg>`
  },
  {
    name: "The North Face",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 45" fill="currentColor">
  <g transform="translate(5, 5)">
    <text x="0" y="13" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="12" letter-spacing="1">THE</text>
    <text x="0" y="24" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="12" letter-spacing="1">NORTH</text>
    <text x="0" y="35" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="12" letter-spacing="1">FACE</text>
    <path d="M55 35 A 30 30 0 0 1 85 5 L 85 35 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
    <path d="M65 35 A 20 20 0 0 1 85 15" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
    <path d="M75 35 A 10 10 0 0 1 85 25" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
  </g>
</svg>`
  },
  {
    name: "Jordan",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="currentColor">
  <text x="50%" y="28" font-family="'Source Sans 3', sans-serif" font-weight="800" font-size="24" text-anchor="middle" letter-spacing="5">JORDAN</text>
</svg>`
  },
  {
    name: "Adidas",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
  <rect x="25" y="50" width="12" height="30" transform="skewX(-30)" />
  <rect x="45" y="30" width="12" height="50" transform="skewX(-30)" />
  <rect x="65" y="10" width="12" height="70" transform="skewX(-30)" />
</svg>`
  },
  {
    name: "Stone Island",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 40" fill="currentColor">
  <text x="50%" y="26" font-family="'Source Sans 3', sans-serif" font-weight="800" font-size="16" text-anchor="middle" letter-spacing="2">STONE ISLAND</text>
</svg>`
  },
  {
    name: "Calvin Klein",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="currentColor">
  <text x="50%" y="28" font-family="'Source Sans 3', sans-serif" font-weight="300" font-size="20" text-anchor="middle" letter-spacing="3">Calvin Klein</text>
</svg>`
  },
  {
    name: "Desigual",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="currentColor">
  <text x="10" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="24" letter-spacing="1">De</text>
  <text x="40" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="24" letter-spacing="1" transform="scale(-1, 1) translate(-65, 0)">s</text>
  <text x="66" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="24" letter-spacing="1">igual</text>
</svg>`
  },
  {
    name: "Helly Hansen",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 45" fill="currentColor">
  <g transform="skewX(-15) translate(25, 0)">
    <rect x="5" y="5" width="15" height="35" />
    <rect x="30" y="5" width="15" height="35" />
    <rect x="15" y="17" width="20" height="11" />
    <rect x="40" y="5" width="15" height="35" />
    <rect x="65" y="5" width="15" height="35" />
    <rect x="50" y="17" width="20" height="11" />
  </g>
</svg>`
  },
  {
    name: "Parajumpers",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" fill="currentColor">
  <text x="50%" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="3">PARAJUMPERS</text>
</svg>`
  },
  {
    name: "Moncler",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="currentColor">
  <text x="50%" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="4">MONCLER</text>
</svg>`
  },
  {
    name: "Bape",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="currentColor">
  <text x="50%" y="28" font-family="'Source Sans 3', sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="3">A BATHING APE</text>
</svg>`
  }
];

async function run() {
  console.log("Ciscenje baze brendova...");
  spawnSync('npx.cmd', ['convex', 'run', 'brands:clear'], { stdio: 'inherit' });

  for (const b of list) {
    console.log(`Ucitavanje SVG logotipa za: ${b.name}...`);
    try {
      const buffer = Buffer.from(b.svg);

      // Generate upload URL
      const genUrlResult = spawnSync('npx.cmd', ['convex', 'run', 'files:generateUploadUrl']);
      if (genUrlResult.error) {
        throw new Error(`Execution error: ${genUrlResult.error.message}`);
      }
      if (genUrlResult.status !== 0) {
        const stderr = genUrlResult.stderr ? genUrlResult.stderr.toString() : 'Unknown error';
        throw new Error(`Convex CLI error (status ${genUrlResult.status}): ${stderr}`);
      }
      if (!genUrlResult.stdout) {
        throw new Error(`No stdout received from Convex CLI`);
      }
      const uploadUrl = genUrlResult.stdout.toString().trim().replace(/^"|"$/g, '');

      console.log(`Otpremanje logotipa u Convex storage za ${b.name}...`);
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/svg+xml'
        },
        body: buffer
      });
      if (!uploadRes.ok) {
        throw new Error(`Greska pri otpremanju: ${uploadRes.statusText}`);
      }
      const { storageId } = await uploadRes.json();
      console.log(`Uspesno otpremljeno! storageId: ${storageId}`);

      // Save to database
      const saveResult = spawnSync('npx.cmd', [
        'convex', 
        'run', 
        'brands:seedWithStorage', 
        JSON.stringify({ name: b.name, logoStorageId: storageId })
      ]);
      
      if (saveResult.status !== 0) {
        throw new Error(`Greska pri cuvanju brenda: ${saveResult.stderr.toString()}`);
      }
      console.log(`Uspesno sacuvan brend ${b.name} u bazi.`);
    } catch (err) {
      console.error(`Greska za brend ${b.name}:`, err.message);
    }
  }

  console.log("Zavrseno lokalno seed-ovanje brendova sa ugradjenim SVG-ovima!");
}

run();
