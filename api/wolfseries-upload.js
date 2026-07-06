const REPO = process.env.GITHUB_REPO || 'lobitoburmann/CYCLINGWOLFACADEMY';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

const CATEGORY_FILES = {
  general: 'lider-general-2026.png',
  montana: 'rey-montana-2026.png',
  volantes: 'metas-volantes-2026.png',
  combativo: 'mas-combativo-2026.png',
  corredor: 'corredor-fecha-2026.png'
};

const MANIFEST_PATH = 'images/wolfseries/manifest.json';

async function githubRequest(path, method, body) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN no configurado');

  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 404 && method === 'GET') return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `GitHub API error ${res.status}`);
  }
  return data;
}

async function getFileSha(path) {
  const data = await githubRequest(path, 'GET');
  return data?.sha || null;
}

async function upsertFile(path, contentBase64, message) {
  const sha = await getFileSha(path);
  await githubRequest(path, 'PUT', {
    message,
    content: contentBase64,
    branch: BRANCH,
    ...(sha ? { sha } : {})
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { category, image, leaderName } = req.body || {};
    if (!category || !CATEGORY_FILES[category]) {
      return res.status(400).json({ error: 'Clasificación inválida' });
    }
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    const base64 = image.replace(/^data:image\/png;base64,/, '');
    if (!base64) return res.status(400).json({ error: 'Formato de imagen inválido' });

    const filename = CATEGORY_FILES[category];
    const imagePath = `images/wolfseries/${filename}`;

    await upsertFile(
      imagePath,
      base64,
      `WolfSeries: actualizar foto ${category} (${leaderName || 'campeón'})`
    );

    let manifest = {};
    const manifestData = await githubRequest(MANIFEST_PATH, 'GET');
    if (manifestData?.content) {
      manifest = JSON.parse(Buffer.from(manifestData.content, 'base64').toString('utf8'));
    }

    manifest[category] = {
      leader: leaderName || manifest[category]?.leader || '',
      file: filename,
      updated: new Date().toISOString()
    };

    await upsertFile(
      MANIFEST_PATH,
      Buffer.from(JSON.stringify(manifest, null, 2) + '\n').toString('base64'),
      `WolfSeries: manifest ${category}`
    );

    return res.status(200).json({
      ok: true,
      file: `/images/wolfseries/${filename}`,
      updated: manifest[category].updated
    });
  } catch (err) {
    console.error('wolfseries-upload:', err);
    return res.status(500).json({ error: err.message || 'Error al guardar imagen' });
  }
};
