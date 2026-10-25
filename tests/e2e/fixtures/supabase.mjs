import http from 'node:http'

let visits = []
http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:3101')
  response.setHeader('content-type', 'application/json')
  if (url.pathname === '/healthz') return response.end('{}')
  if (url.pathname === '/visits' && request.method === 'DELETE') { visits = []; return response.end('{}') }
  if (url.pathname === '/visits') return response.end(JSON.stringify(visits))
  if (url.pathname === '/destination') { response.setHeader('content-type', 'text/html'); return response.end('<h1>Test destination</h1>') }
  if (url.pathname === '/rest/v1/urls') return response.end(JSON.stringify(url.searchParams.get('short_id') === 'eq.hello'
    ? [{ id: 7, long_url: 'http://127.0.0.1:3101/destination' }] : []))
  if (url.pathname === '/rest/v1/accesseds' && request.method === 'POST') {
    let body = ''
    for await (const chunk of request) body += chunk
    visits.push(JSON.parse(body))
    response.statusCode = 201
    return response.end('')
  }
  response.statusCode = 404
  response.end('{}')
}).listen(3101, '127.0.0.1')
