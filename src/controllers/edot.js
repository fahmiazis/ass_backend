const response = require('../helpers/response')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const { edot_token } = require('../models')
const bcrypt = require('bcryptjs')

const EDOT_CONFIG = {
  baseUrl: 'https://staging.nabatisnack.co.id',
  appId: 'pma' // default app_id
}

// Fungsi decode custom JWT token
const decodeCustomToken = function(token, codeCipher) {
  try {
    console.log('Decoding token with cipher:', codeCipher)
    
    const parts = token.split('.')
    if (parts.length !== 4) {
      throw new Error('Invalid token format, expected 4 parts but got ' + parts.length)
    }

    // Code cipher format (6 digit):
    // Digit 1 = Header prefix, Digit 2 = Header suffix
    // Digit 3 = Payload prefix, Digit 4 = Payload suffix
    // Digit 5 = Signature prefix, Digit 6 = Signature suffix
    const headerPrefix = parseInt(codeCipher.substring(0, 1))
    const headerSuffix = parseInt(codeCipher.substring(1, 2))
    const payloadPrefix = parseInt(codeCipher.substring(2, 3))
    const payloadSuffix = parseInt(codeCipher.substring(3, 4))
    const signaturePrefix = parseInt(codeCipher.substring(4, 5))
    const signatureSuffix = parseInt(codeCipher.substring(5, 6))

    // Remove salt dari setiap part
    const removeSalt = function(str, prefix, suffix) {
      if (suffix === 0) {
        return str.substring(prefix)
      }
      return str.substring(prefix, str.length - suffix)
    }

    const header = removeSalt(parts[0], headerPrefix, headerSuffix)
    const payload = removeSalt(parts[1], payloadPrefix, payloadSuffix)
    const signature = removeSalt(parts[2], signaturePrefix, signatureSuffix)
    const id = parts[3]

    // Reconstruct JWT token
    const reconstructedToken = header + '.' + payload + '.' + signature
    
    // Decode JWT
    let decoded = jwt.decode(reconstructedToken)
    
    if (!decoded) {
      // Manual base64 decode
      let base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/')
      while (base64Payload.length % 4) {
        base64Payload += '='
      }
      const jsonPayload = Buffer.from(base64Payload, 'base64').toString('utf8')
      decoded = JSON.parse(jsonPayload)
    }
    
    return {
      decoded: decoded,
      reconstructedToken: reconstructedToken,
      id: id
    }
  } catch (error) {
    throw new Error('Failed to decode token: ' + error.message)
  }
}

// Fungsi untuk login EDOT dan simpan ke database
const loginEdot = async function(tokenRecord) {
  try {
    console.log('Logging in to EDOT...')
    
    // Decrypt password jika perlu (atau simpan plain untuk testing)
    const password = tokenRecord.password
    
    const loginResponse = await axios.post(
      EDOT_CONFIG.baseUrl + '/gateway/auth/login',
      {
        username: tokenRecord.username,
        password: password,
        app_id: tokenRecord.app_id
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
    
    const loginData = loginResponse.data
    console.log('Login success, decoding token...')
    
    // Decode token
    const result = decodeCustomToken(loginData.token, tokenRecord.code_cipher)
    const decoded = result.decoded
    
    // Update record di database
    await tokenRecord.update({
      raw_token: loginData.token,
      access_token: decoded.data.access_token,
      jti: decoded.jti,
      exp: decoded.exp,
      iat: decoded.iat,
      status: 'active',
      last_used: new Date()
    })
    
    console.log('Token saved to database')
    
    return {
      access_token: decoded.data.access_token,
      jti: decoded.jti,
      exp: decoded.exp
    }
  } catch (error) {
    // Handle 409 - already logged in
    if (error.response && error.response.status === 409) {
      console.log('User already logged in, using existing token from DB')
      
      // Cek apakah token di DB masih valid
      if (tokenRecord.access_token && tokenRecord.exp) {
        const now = Math.floor(Date.now() / 1000)
        if (tokenRecord.exp > now) {
          return {
            access_token: tokenRecord.access_token,
            jti: tokenRecord.jti,
            exp: tokenRecord.exp
          }
        }
      }
      
      throw new Error('Already logged in but no valid token in DB. Please wait for token to expire or refresh manually.')
    }
    
    throw new Error('Login failed: ' + (error.response && error.response.data ? error.response.data.message : error.message))
  }
}

// Fungsi untuk refresh token
const refreshEdotToken = async function(tokenRecord) {
  try {
    console.log('Refreshing token...')
    
    const refreshResponse = await axios.post(
      EDOT_CONFIG.baseUrl + '/gateway/auth/refresh',
      { refresh_token: tokenRecord.jti },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
    
    const refreshData = refreshResponse.data
    const result = decodeCustomToken(refreshData.token, tokenRecord.code_cipher)
    const decoded = result.decoded
    
    // Update record di database
    await tokenRecord.update({
      raw_token: refreshData.token,
      access_token: decoded.data.access_token,
      jti: decoded.jti,
      exp: decoded.exp,
      iat: decoded.iat,
      status: 'active',
      last_used: new Date()
    })
    
    console.log('Token refreshed and saved')
    
    return {
      access_token: decoded.data.access_token,
      jti: decoded.jti,
      exp: decoded.exp
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Refresh token expired, need to re-login')
      return null
    }
    throw error
  }
}

// Fungsi untuk get valid token (auto login/refresh jika perlu)
const getValidToken = async function(appId) {
  // Cari token record dari database
  const tokenRecord = await edot_token.findOne({
    where: { app_id: appId || EDOT_CONFIG.appId, status: 'active' }
  })
  
  if (!tokenRecord) {
    throw new Error('No EDOT credential found for app_id: ' + (appId || EDOT_CONFIG.appId) + '. Please add credential first.')
  }
  
  const now = Math.floor(Date.now() / 1000)
  
  // Cek apakah token masih valid (ada buffer 5 menit)
  if (tokenRecord.access_token && tokenRecord.exp && (tokenRecord.exp - 300) > now) {
    console.log('Using existing valid token')
    await tokenRecord.update({ last_used: new Date() })
    return {
      access_token: tokenRecord.access_token,
      jti: tokenRecord.jti,
      exp: tokenRecord.exp,
      tokenRecord: tokenRecord
    }
  }
  
  // Token expired atau belum ada, coba refresh dulu
  if (tokenRecord.jti) {
    console.log('Token expired, trying to refresh...')
    const refreshedToken = await refreshEdotToken(tokenRecord)
    
    if (refreshedToken) {
      return {
        access_token: refreshedToken.access_token,
        jti: refreshedToken.jti,
        exp: refreshedToken.exp,
        tokenRecord: tokenRecord
      }
    }
  }
  
  // Refresh gagal atau belum pernah login, coba login
  console.log('Attempting to login...')
  const loginToken = await loginEdot(tokenRecord)
  
  return {
    access_token: loginToken.access_token,
    jti: loginToken.jti,
    exp: loginToken.exp,
    tokenRecord: tokenRecord
  }
}

// Fungsi untuk make API call dengan auto refresh
const makeEdotRequest = async function(endpoint, method, appId) {
  const tokenData = await getValidToken(appId)
  
  try {
    const apiResponse = await axios({
      method: method || 'GET',
      url: EDOT_CONFIG.baseUrl + endpoint,
      headers: {
        'Authorization': 'Bearer ' + tokenData.access_token,
        'Content-Type': 'application/json'
      }
    })
    
    return {
      data: apiResponse.data,
      tokenInfo: {
        access_token: tokenData.access_token,
        exp: tokenData.exp
      }
    }
  } catch (error) {
    // Handle 440 - token expired
    if (error.response && error.response.status === 440) {
      console.log('Got 440, refreshing token...')
      
      let refreshedToken = await refreshEdotToken(tokenData.tokenRecord)
      
      if (!refreshedToken) {
        // Refresh failed, try login
        refreshedToken = await loginEdot(tokenData.tokenRecord)
      }
      
      // Retry request
      const retryResponse = await axios({
        method: method || 'GET',
        url: EDOT_CONFIG.baseUrl + endpoint,
        headers: {
          'Authorization': 'Bearer ' + refreshedToken.access_token,
          'Content-Type': 'application/json'
        }
      })
      
      return {
        data: retryResponse.data,
        tokenInfo: {
          access_token: refreshedToken.access_token,
          exp: refreshedToken.exp
        }
      }
    }
    
    throw error
  }
}

module.exports = {
  // Endpoint untuk tambah/update credential EDOT
  addEdotCredential: async function(req, res) {
    try {
      const schema = require('joi').object({
        app_id: require('joi').string().required(),
        username: require('joi').string().required(),
        password: require('joi').string().required(),
        code_cipher: require('joi').string().length(6).required()
      })
      
      const validation = schema.validate(req.body)
      if (validation.error) {
        return response(res, 'Validation error', { error: validation.error.message }, 400, false)
      }
      
      const data = validation.value
      
      // Cek apakah sudah ada
      const existing = await edot_token.findOne({ where: { app_id: data.app_id } })
      
      if (existing) {
        // Update existing
        await existing.update({
          username: data.username,
          password: data.password,
          code_cipher: data.code_cipher,
          status: 'active'
        })
        return response(res, 'EDOT credential updated', { result: existing })
      } else {
        // Create new
        const result = await edot_token.create({
          app_id: data.app_id,
          username: data.username,
          password: data.password,
          code_cipher: data.code_cipher,
          status: 'active'
        })
        return response(res, 'EDOT credential created', { result: result })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },

  // Endpoint untuk update token manual (dari Postman)
  updateEdotToken: async function(req, res) {
    try {
      const schema = require('joi').object({
        app_id: require('joi').string().required(),
        raw_token: require('joi').string().required()
      })
      
      const validation = schema.validate(req.body)
      if (validation.error) {
        return response(res, 'Validation error', { error: validation.error.message }, 400, false)
      }
      
      const data = validation.value
      
      const tokenRecord = await edot_token.findOne({ where: { app_id: data.app_id } })
      
      if (!tokenRecord) {
        return response(res, 'Credential not found for app_id: ' + data.app_id, {}, 404, false)
      }
      
      // Decode token
      const result = decodeCustomToken(data.raw_token, tokenRecord.code_cipher)
      const decoded = result.decoded
      
      // Update record
      await tokenRecord.update({
        raw_token: data.raw_token,
        access_token: decoded.data.access_token,
        jti: decoded.jti,
        exp: decoded.exp,
        iat: decoded.iat,
        status: 'active',
        last_used: new Date()
      })
      
      return response(res, 'Token updated successfully', {
        result: {
          app_id: tokenRecord.app_id,
          access_token: decoded.data.access_token,
          jti: decoded.jti,
          exp: decoded.exp,
          exp_readable: new Date(decoded.exp * 1000).toISOString()
        }
      })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },

  // Endpoint untuk get token info
  getEdotTokenInfo: async function(req, res) {
    try {
      const appId = req.params.app_id || EDOT_CONFIG.appId
      
      const tokenRecord = await edot_token.findOne({ where: { app_id: appId } })
      
      if (!tokenRecord) {
        return response(res, 'Token not found', {}, 404, false)
      }
      
      const now = Math.floor(Date.now() / 1000)
      const isExpired = tokenRecord.exp ? tokenRecord.exp < now : true
      
      return response(res, 'Token info', {
        result: {
          app_id: tokenRecord.app_id,
          username: tokenRecord.username,
          access_token: tokenRecord.access_token,
          exp: tokenRecord.exp,
          exp_readable: tokenRecord.exp ? new Date(tokenRecord.exp * 1000).toISOString() : null,
          is_expired: isExpired,
          status: tokenRecord.status,
          last_used: tokenRecord.last_used
        }
      })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },

  // Onboarding endpoint
  getOnboarding: async function(req, res) {
    try {
      console.log('Fetching onboarding data...')
      
      const appId = req.query.app_id || EDOT_CONFIG.appId
      const result = await makeEdotRequest('/gateway/miniapps/onboarding', 'GET', appId)
      
      if (result) {
        return response(res, 'Success get onboarding data', { 
          result: result.data,
          tokenInfo: result.tokenInfo
        })
      } else {
        return response(res, 'Failed to get onboarding data', {}, 404, false)
      }
    } catch (error) {
      console.error('Onboarding Error:', error.message)
      const errMsg = error.response && error.response.data ? error.response.data.message : error.message
      return response(res, errMsg || error.message, {}, 500, false)
    }
  },

  // Offboarding endpoint
  getOffboarding: async function(req, res) {
    try {
      console.log('Fetching offboarding data...')
      
      const appId = req.query.app_id || EDOT_CONFIG.appId
      const result = await makeEdotRequest('/gateway/miniapps/offboarding', 'GET', appId)
      
      if (result) {
        return response(res, 'Success get offboarding data', { 
          result: result.data,
          tokenInfo: result.tokenInfo
        })
      } else {
        return response(res, 'Failed to get offboarding data', {}, 404, false)
      }
    } catch (error) {
      console.error('Offboarding Error:', error.message)
      const errMsg = error.response && error.response.data ? error.response.data.message : error.message
      return response(res, errMsg || error.message, {}, 500, false)
    }
  },

  // Test decode token
  testDecodeToken: async function(req, res) {
    try {
      const appId = req.query.app_id || EDOT_CONFIG.appId
      
      const tokenRecord = await edot_token.findOne({ where: { app_id: appId } })
      
      if (!tokenRecord || !tokenRecord.raw_token) {
        return response(res, 'No token found for app_id: ' + appId, {}, 404, false)
      }
      
      const result = decodeCustomToken(tokenRecord.raw_token, tokenRecord.code_cipher)
      
      return response(res, 'Token decoded successfully', {
        decoded: result.decoded,
        id: result.id,
        extracted: {
          access_token: result.decoded && result.decoded.data ? result.decoded.data.access_token : null,
          jti: result.decoded ? result.decoded.jti : null,
          exp: result.decoded ? result.decoded.exp : null,
          exp_readable: result.decoded && result.decoded.exp ? new Date(result.decoded.exp * 1000).toISOString() : null
        }
      })
    } catch (error) {
      console.error('Decode Error:', error.message)
      return response(res, error.message, {}, 500, false)
    }
  }
}