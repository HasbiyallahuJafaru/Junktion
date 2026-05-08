const { generateKeyPairSync } = require('crypto')
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
console.log('JWT_PRIVATE_KEY=' + Buffer.from(privateKey.export({ type: 'pkcs8', format: 'pem' })).toString('base64'))
console.log('JWT_PUBLIC_KEY=' + Buffer.from(publicKey.export({ type: 'spki', format: 'pem' })).toString('base64'))
