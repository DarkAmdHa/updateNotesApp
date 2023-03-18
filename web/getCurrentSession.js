import { PostgreSQLSessionStorage } from '@shopify/shopify-app-session-storage-postgresql'

import shopify from './shopify.js'

const getCurrentSesssion = async (shop) => {
  const DB_PATH = process.env.POSTGRES_PATH
  // const DB_PATH = "postgres://postgres:myPassword@localhost:5432"
  const sessionObject = new PostgreSQLSessionStorage(DB_PATH)
  const offlineId = shopify.api.session.getOfflineId(shop)
  const session = await sessionObject.loadSession(offlineId)
  return session
}

export default getCurrentSesssion
