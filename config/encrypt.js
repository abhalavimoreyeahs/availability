module.exports = {
    encryption: {
      hash: 'pocketcfohash',
      iv: 'pocketcfoiv',
    },
    secret: process.env.secret || 'secretKey'
  };