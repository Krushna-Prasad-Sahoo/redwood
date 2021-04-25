import { Request } from 'graphql-helix'

export type CorsConfig = {
  origin?: boolean | string | string[]
  methods?: string | string[]
  allowedHeaders?: string | string[]
  exposedHeaders?: string | string[]
  credentials?: boolean
  maxAge?: number
}

export type CorsHeaders = Record<string, string>
export type CorsContext = ReturnType<typeof createCorsContext>

export function createCorsContext(cors: CorsConfig | undefined) {
  // Taken from apollo-server-lambda
  const corsHeaders = new Headers()

  if (cors) {
    if (cors.methods) {
      if (typeof cors.methods === 'string') {
        corsHeaders.set('access-control-allow-methods', cors.methods)
      } else if (Array.isArray(cors.methods)) {
        corsHeaders.set('access-control-allow-methods', cors.methods.join(','))
      }
    }

    if (cors.allowedHeaders) {
      if (typeof cors.allowedHeaders === 'string') {
        corsHeaders.set('access-control-allow-headers', cors.allowedHeaders)
      } else if (Array.isArray(cors.allowedHeaders)) {
        corsHeaders.set(
          'access-control-allow-headers',
          cors.allowedHeaders.join(',')
        )
      }
    }

    if (cors.exposedHeaders) {
      if (typeof cors.exposedHeaders === 'string') {
        corsHeaders.set('access-control-expose-headers', cors.exposedHeaders)
      } else if (Array.isArray(cors.exposedHeaders)) {
        corsHeaders.set(
          'access-control-expose-headers',
          cors.exposedHeaders.join(',')
        )
      }
    }

    if (cors.credentials) {
      corsHeaders.set('access-control-allow-credentials', 'true')
    }
    if (typeof cors.maxAge === 'number') {
      corsHeaders.set('access-control-max-age', cors.maxAge.toString())
    }
  }

  return {
    shouldHandleCors(request: Request) {
      return request.method === 'OPTIONS'
    },
    getRequestHeaders(request: Request): CorsHeaders {
      const eventHeaders = new Headers(
        request.headers as Record<string, string>
      )
      const requestCorsHeaders = new Headers(corsHeaders)

      if (cors && cors.origin) {
        const requestOrigin = eventHeaders.get('origin')
        if (typeof cors.origin === 'string') {
          requestCorsHeaders.set('access-control-allow-origin', cors.origin)
        } else if (
          requestOrigin &&
          (typeof cors.origin === 'boolean' ||
            (Array.isArray(cors.origin) &&
              requestOrigin &&
              cors.origin.includes(requestOrigin)))
        ) {
          requestCorsHeaders.set('access-control-allow-origin', requestOrigin)
        }

        const requestAccessControlRequestHeaders = eventHeaders.get(
          'access-control-request-headers'
        )
        if (!cors.allowedHeaders && requestAccessControlRequestHeaders) {
          requestCorsHeaders.set(
            'access-control-allow-headers',
            requestAccessControlRequestHeaders
          )
        }
      }

      return Object.fromEntries(requestCorsHeaders.entries())
    },
  }
}
