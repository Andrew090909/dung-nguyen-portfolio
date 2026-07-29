import { getUser, verifyRequestOrigin } from '@netlify/identity'

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
})

function allowedPath(file) {
  return [
    'content/translations.json',
    'content/site.json',
    'content/posts.json',
    'content/portfolio-v72.enc.json',
  ].includes(file) || /^assets\/images\/uploads\/[a-zA-Z0-9._-]+$/.test(file)
}

async function github(path, options = {}) {
  const repo = process.env.GITHUB_REPO
  const token = process.env.GITHUB_TOKEN
  if (!repo || !token) throw new Error('Missing GITHUB_REPO or GITHUB_TOKEN environment variable.')
  const branch = process.env.GITHUB_BRANCH || 'main'
  const url = `https://api.github.com/repos/${repo}/contents/${path}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'accept': 'application/vnd.github+json',
      'authorization': `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  })
  return { response, branch }
}

export default async (req) => {
  try {
    verifyRequestOrigin(req)
    const user = await getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
    if (adminEmail && user.email?.toLowerCase() !== adminEmail) {
      return json({ error: 'Forbidden' }, 403)
    }

    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
    const body = await req.json()
    const file = String(body.file || '')
    if (!allowedPath(file)) return json({ error: 'File path is not allowed' }, 400)

    let base64
    if (body.action === 'upload') {
      if (!body.base64) return json({ error: 'Missing upload data' }, 400)
      base64 = body.base64
    } else if (body.action === 'write') {
      base64 = Buffer.from(String(body.content || ''), 'utf8').toString('base64')
    } else {
      return json({ error: 'Unsupported action' }, 400)
    }

    let sha
    const current = await github(file)
    if (current.response.ok) {
      const meta = await current.response.json()
      sha = meta.sha
    } else if (current.response.status !== 404) {
      const text = await current.response.text()
      throw new Error(`GitHub read failed: ${current.response.status} ${text}`)
    }

    const { response, branch } = await github(file, {
      method: 'PUT',
      body: JSON.stringify({
        message: body.message || `Update ${file} from website admin`,
        content: base64,
        branch,
        ...(sha ? { sha } : {}),
      }),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.message || `GitHub write failed: ${response.status}`)
    return json({ ok: true, path: file, commit: result.commit?.sha })
  } catch (error) {
    console.error(error)
    return json({ error: error?.message || 'Unexpected error' }, 500)
  }
}
