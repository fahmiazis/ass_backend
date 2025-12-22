const admin = require('./adminFirebase')

const sendFCMNotification = async (fcmToken, title, body, data = {}) => {
  try {
    if (!fcmToken) {
      console.log('No FCM token provided')
      return null
    }

    // Convert semua data menjadi string (requirement FCM)
    const stringData = {}
    Object.keys(data).forEach(key => {
      stringData[key] = String(data[key])
    })

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: stringData,
      token: fcmToken,
      // Config untuk Android
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default_channel_id'
        }
      },
      // Config untuk iOS
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    }

    const response = await admin.messaging().send(message)
    console.log('FCM notification sent successfully:', response)
    return response
  } catch (error) {
    console.error('Error sending FCM notification:', error.message)
    // Jangan throw error supaya tidak mengganggu proses utama
    return null
  }
}

const sendFCMNotificationMultiple = async (fcmTokens, title, body, data = {}) => {
  try {
    if (!fcmTokens || fcmTokens.length === 0) {
      console.log('No FCM tokens provided')
      return null
    }

    // Convert semua data menjadi string
    const stringData = {}
    Object.keys(data).forEach(key => {
      stringData[key] = String(data[key])
    })

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: stringData,
      tokens: fcmTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default_channel_id'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    }

    // Untuk firebase-admin v9, gunakan sendMulticast
    const response = await admin.messaging().sendMulticast(message)
    console.log('FCM notifications sent:', {
      success: response.successCount,
      failure: response.failureCount
    })
    return response
  } catch (error) {
    console.error('Error sending FCM notifications:', error.message)
    return null
  }
}

module.exports = {
  sendFCMNotification,
  sendFCMNotificationMultiple
}
